'use server'

import prisma from '@/prisma/prisma'

export async function signup(email: string, password: string) {
  try {
    await prisma.user.create({
      data: {
        email: email,
        password: password,
      },
    })
    return true
  } catch (error) {
    console.error('Error creating user:', error)
    return false
  }
}
