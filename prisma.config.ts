import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})