import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const JWT_SECRET = 'my-secret-key'

export function generatePassword(password: string) {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

export function verifyPassword(userPassword: string, hashedPassword: string) {
  return bcrypt.compareSync(userPassword, hashedPassword)
}
export function generateToken(userId: string, role: string) {
  const token = jwt.sign(
    {
      userId,
      role,
    },
    JWT_SECRET
  )
  return token
}
