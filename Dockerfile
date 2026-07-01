FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma

# Set build-time secret for NextAuth
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

RUN npm ci

# Copy source
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]