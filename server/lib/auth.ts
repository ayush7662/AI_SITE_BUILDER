import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(",") || [];

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET

if (!BETTER_AUTH_URL) {
  throw new Error('Missing env var: BETTER_AUTH_URL')
}
if (!BETTER_AUTH_SECRET) {
  throw new Error('Missing env var: BETTER_AUTH_SECRET')
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  trustedOrigins,

  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,

  advanced: {
    cookies: {
      session_token: {
        name: "auth_session",
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite:
            process.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
        },
      },
    },
  },
})

