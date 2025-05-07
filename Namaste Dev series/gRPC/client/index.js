const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const grpcClient = require('./client');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes for API endpoints
app.get('/api/customers', (req, res) => {
  grpcClient.getAll({}, (err, response) => {
    if (err) {
      console.error('gRPC error:', err);
      res.status(500).send({ error: err.details || 'Internal Server Error' });
      return;
    }
    res.json(response.customers);
  });
});

app.get('/api/customers/:id', (req, res) => {
  const id = req.params.id;
  grpcClient.get({ id }, (err, customer) => {
    if (err) {
      console.error('gRPC error:', err);
      res.status(404).send({ error: err.details || 'Customer not found' });
      return;
    }
    res.json(customer);
  });
});

app.post('/api/customers', (req, res) => {
  const customer = req.body;
  grpcClient.insert(customer, (err, response) => {
    if (err) {
      console.error('gRPC error:', err);
      res.status(500).send({ error: err.details || 'Failed to create customer' });
      return;
    }
    res.json(response);
  });
});

app.put('/api/customers/:id', (req, res) => {
  const customer = req.body;
  customer.id = req.params.id;
  grpcClient.update(customer, (err, response) => {
    if (err) {
      console.error('gRPC error:', err);
      res.status(404).send({ error: err.details || 'Customer not found' });
      return;
    }
    res.json(response);
  });
});

app.delete('/api/customers/:id', (req, res) => {
  const id = req.params.id;
  grpcClient.delete({ id }, (err, response) => {
    if (err) {
      console.error('gRPC error:', err);
      res.status(404).send({ error: err.details || 'Customer not found' });
      return;
    }
    res.json({ success: true });
  });
});

// Serve the main index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
});
