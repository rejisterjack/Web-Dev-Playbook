const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Broadcast to all clients except the sender
  socket.broadcast.emit('user joined', `User ${socket.id.substr(0, 5)} joined`);
  
  // Listen for chat messages
  socket.on('chat message', (msg) => {
    console.log(`Message from ${socket.id}: ${msg}`);
    
    // Broadcast to all connected clients
    io.emit('chat message', {
      userId: socket.id.substr(0, 5),
      message: msg,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    io.emit('user left', `User ${socket.id.substr(0, 5)} left`);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
