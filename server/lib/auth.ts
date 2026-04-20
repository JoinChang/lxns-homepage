import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from './prisma'
import { ApiError } from './errors'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)

if (!process.env.BETTER_AUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BETTER_AUTH_SECRET is required in production')
  }
  console.warn('BETTER_AUTH_SECRET is not set, using a default value. This is not secure and should only be used for development.')
}

function resolveRole(email: string | null | undefined): 'ADMIN' | 'USER' {
  if (!email) return 'USER'
  return ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email) ? 'ADMIN' : 'USER'
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: false,
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
  },
  trustedOrigins: [
    'http://localhost:5173',
    process.env.BETTER_AUTH_URL || 'http://localhost:5173',
  ],
  secret: process.env.BETTER_AUTH_SECRET || '',
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'USER',
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(user.email)) {
            throw new Error('此邮箱未被授权访问')
          }
          return {
            data: { ...user, role: resolveRole(user.email) },
          }
        },
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user

export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) headers.set(key, value.join(','))
    else if (typeof value === 'string') headers.set(key, value)
  }

  const session = await auth.api.getSession({ headers })
  if (!session?.user) {
    throw ApiError.unauthorized()
  }

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') {
    throw ApiError.forbidden('Forbidden: admin only')
  }

  ;(req as Request & { user: typeof session.user }).user = session.user
  next()
}
