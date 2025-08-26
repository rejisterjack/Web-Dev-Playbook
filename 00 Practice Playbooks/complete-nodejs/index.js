const express = require('express')
const port = 3000

const app = express()

const loggerMiddleware = (req, res, next) => {
  console.log(`${new Date()} --- Request ${req.method} | ${req.url}`)
  next()
}

app.use(loggerMiddleware)

app.get('/', (req, res) => {
  res.send('server is up and running')
})

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`)
})
