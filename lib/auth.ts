import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

if (process.env.NODE_ENV !== "production" && process.env.NEXTAUTH_URL?.includes("vercel.app")) {
  process.env.NEXTAUTH_URL = "http://localhost:3000";
}

const authSecret =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  (process.env.NODE_ENV === "production"
    ? undefined
    : "local-dev-secret-change-me");

if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error("NEXTAUTH_SECRET or AUTH_SECRET is required in production");
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) return null;

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            vendorId: user.vendorId,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
  async jwt({ token, user }) {
  if (user) {
    token.id       = user.id as string;
    token.role     = user.role as UserRole;
    token.vendorId = (user as any).vendorId ?? null;
  }
  // Only refresh role from DB when token.id exists AND it's not a new login
  if (token.id && !user) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { role: true, vendorId: true },
      });
      if (dbUser) {
        token.role     = dbUser.role as UserRole;
        token.vendorId = dbUser.vendorId ?? null;
      }
    } catch (e) {
      console.error("JWT role refresh error:", e);
      // keep existing token.role if DB call fails
    }
  }
  return token;
},
    async session({ session, token }) {
      if (session.user) {
        session.user.id       = token.id as string;
        session.user.role     = token.role as UserRole;
        session.user.vendorId = token.vendorId ?? null;
      }
      return session;
    },
  },
};