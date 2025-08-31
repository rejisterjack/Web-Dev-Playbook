import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import prisma from './prisma/database'
import { signup, login } from './controllers/user.controller'
import { createBook, getAllBooks } from './controllers/book.controller'
import { createAuthor, getAllAuthors } from './controllers/author.controller'
import {
  createCategory,
  getAllCategories,
} from './controllers/category.controller'
import { borrowBook, returnBook } from './controllers/borrow.controller'
import { authenticate } from './middleware/auth.middleware'

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

// Public routes
app.post('/signup', signup)
app.post('/login', login)

// Protected routes
app.post('/books', authenticate, createBook)
app.get('/books', authenticate, getAllBooks)

app.post('/authors', authenticate, createAuthor)
app.get('/authors', authenticate, getAllAuthors)

app.post('/categories', authenticate, createCategory)
app.get('/categories', authenticate, getAllCategories)

app.post('/borrow', authenticate, borrowBook)
app.post('/return', authenticate, returnBook)

// Health check
app.get('/', (_req, res) => {
  res.send('📚 Library API is running!')
})

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error:', err)
  res.status(500).json({ error: 'Something went wrong.' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
