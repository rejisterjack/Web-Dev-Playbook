const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// In-memory data store (simulating a database)
let messages = [];
let subscribers = [];

// Short polling endpoint
app.get('/api/short-poll', (req, res) => {
  res.json({
    messages,
    timestamp: Date.now()
  });
});

// Long polling endpoint
app.get('/api/long-poll', (req, res) => {
  const lastMessageTimestamp = parseInt(req.query.timestamp) || 0;
  
  // Check if there are new messages since the timestamp
  const newMessages = messages.filter(msg => msg.timestamp > lastMessageTimestamp);
  
  if (newMessages.length > 0) {
    // If new messages exist, send them immediately
    return res.json({
      messages: newMessages,
      timestamp: Date.now()
    });
  }
  
  // If no new messages, hold the request open
  const subscriber = {
    res,
    timestamp: Date.now()
  };
  
  subscribers.push(subscriber);
  
  // Set timeout to avoid keeping connection open too long (30 seconds)
  setTimeout(() => {
    const index = subscribers.indexOf(subscriber);
    if (index !== -1) {
      subscribers.splice(index, 1);
      res.json({
        messages: [],
        timestamp: Date.now()
      });
    }
  }, 30000);
  
  // Handle client disconnection
  req.on('close', () => {
    const index = subscribers.indexOf(subscriber);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  });
});

// Endpoint to add a new message (for testing)
app.post('/api/message', (req, res) => {
  const newMessage = {
    id: messages.length + 1,
    text: req.body.text || 'Default message',
    timestamp: Date.now()
  };
  
  messages.push(newMessage);
  
  // Notify all subscribers waiting for updates
  subscribers.forEach(subscriber => {
    subscriber.res.json({
      messages: [newMessage],
      timestamp: Date.now()
    });
  });
  
  subscribers = [];
  
  res.status(201).json(newMessage);
});

// Simulate data updates on the server (for demo purposes)
setInterval(() => {
  const newMessage = {
    id: messages.length + 1,
    text: `Server update at ${new Date().toLocaleTimeString()}`,
    timestamp: Date.now()
  };
  
  messages.push(newMessage);
  
  // Notify all subscribers waiting for updates
  subscribers.forEach(subscriber => {
    subscriber.res.json({
      messages: [newMessage],
      timestamp: Date.now()
    });
  });
  
  subscribers = [];
  
  // Keep only the most recent 10 messages
  if (messages.length > 10) {
    messages = messages.slice(messages.length - 10);
  }
  
}, 15000); // Add a message every 15 seconds

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
