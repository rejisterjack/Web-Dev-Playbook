const express = require('express')
const path = require('path')
const app = express()

// Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// SSE endpoint
app.get('/events', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Send a message immediately when client connects
  res.write(
    `data: ${JSON.stringify({ message: 'Connected to event stream!' })}\n\n`
  )

  // Send a new message every 3 seconds
  const intervalId = setInterval(() => {
    const data = {
      time: new Date().toLocaleTimeString(),
      message: `Server update at ${new Date().toLocaleTimeString()}`,
    }

    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }, 3000)

  // Clean up when client disconnects
  req.on('close', () => {
    clearInterval(intervalId)
  })
})

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
