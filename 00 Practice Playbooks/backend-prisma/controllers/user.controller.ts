import type { Request, Response } from 'express'
import prisma from '../prisma/database'
import { generateToken, verifyPassword } from '../utils/auth'

export const signup = async (req: Request, res: Response): any => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Missing required fields',
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: 'Invalid email',
    })
  }

  if (name.length < 3) {
    return res.status(400).json({
      message: 'Name must be at least 3 characters',
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters',
    })
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return res.status(400).json({
      message: 'User already exists',
    })
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  })

  return res.status(201).json({ user })
}

export const login = async (req: Request, res: Response): any => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: 'Missing required fields',
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    })
  }

  if (!verifyPassword(password, user.password)) {
    return res.status(401).json({
      message: 'Invalid password',
    })
  }

  const token = generateToken(user.id, user.role)

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
  return res.status(200).json({ token })
}
