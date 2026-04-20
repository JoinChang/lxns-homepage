import { Router } from 'express'
import { toNodeHandler } from 'better-auth/node'
import { auth } from '../lib/auth'

export function createAuthRouter() {
  const router = Router()

  router.all("*all", toNodeHandler(auth));

  return router
}
