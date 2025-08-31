import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { JWT_SECRET } from '../utils/auth'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const BearerToken: string = req.cookies.token || req.headers.authorization

  if (!BearerToken.startsWith('Bearer '))
    res.status(401).json({ error: 'Unauthorized' })

  const token = BearerToken.split('Bearer ')[1] || ''

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      role: string
    }
    ;(req as any).user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
