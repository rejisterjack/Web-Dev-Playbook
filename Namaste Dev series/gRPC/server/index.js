const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')

const PROTO_PATH = __dirname + '/customers.proto'

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
})

const customersProto = grpc.loadPackageDefinition(packageDefinition)

const server = new grpc.Server()

const customers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "555-1234",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
    country: "USA",
    orders: []
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "555-2345",
    address: "456 Oak Ave",
    city: "Springfield",
    state: "IL",
    zip: "67890",
    country: "USA",
    orders: []
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "555-3456",
    address: "789 Pine Rd",
    city: "Metropolis",
    state: "NY",
    zip: "10001",
    country: "USA",
    orders: []
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    phone: "555-4567",
    address: "321 Elm St",
    city: "Riverside",
    state: "TX",
    zip: "75001",
    country: "USA",
    orders: []
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    phone: "555-5678",
    address: "654 Maple Dr",
    city: "Boston",
    state: "MA",
    zip: "02101",
    country: "USA",
    orders: []
  },
  {
    id: "6",
    name: "Diana Miller",
    email: "diana.miller@example.com",
    phone: "555-6789",
    address: "987 Cedar Ln",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    country: "USA",
    orders: []
  },
  {
    id: "7",
    name: "Edward Taylor",
    email: "edward.taylor@example.com",
    phone: "555-7890",
    address: "135 Birch Ave",
    city: "Portland",
    state: "OR",
    zip: "97201",
    country: "USA",
    orders: []
  },
  {
    id: "8",
    name: "Fiona Garcia",
    email: "fiona.garcia@example.com",
    phone: "555-8901",
    address: "246 Walnut St",
    city: "Miami",
    state: "FL",
    zip: "33101",
    country: "USA",
    orders: []
  },
  {
    id: "9",
    name: "George Martinez",
    email: "george.martinez@example.com",
    phone: "555-9012",
    address: "357 Cherry Blvd",
    city: "San Francisco",
    state: "CA",
    zip: "94101",
    country: "USA",
    orders: []
  },
  {
    id: "10",
    name: "Hannah Lee",
    email: "hannah.lee@example.com",
    phone: "555-0123",
    address: "468 Pineapple Way",
    city: "Honolulu",
    state: "HI",
    zip: "96801",
    country: "USA",
    orders: []
  }
]

server.addService(customersProto.CustomerService.service, {
  getAll: (call, callback) => {
    callback(null, { customers })
  },
  get: (call, callback) => {
    const customer = customers.find(c => c.id === call.request.id)
    if (customer) {
      callback(null, customer)
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Customer not found',
      })
    }
  },
  insert: (call, callback) => {
    const newCustomer = call.request
    newCustomer.id = String(customers.length + 1)
    customers.push(newCustomer)
    callback(null, newCustomer)
  },
  update: (call, callback) => {
    const updatedCustomer = call.request
    const index = customers.findIndex(c => c.id === updatedCustomer.id)
    if (index !== -1) {
      customers[index] = updatedCustomer
      callback(null, updatedCustomer)
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Customer not found',
      })
    }
  },
  delete: (call, callback) => {
    const id = call.request.id
    const index = customers.findIndex(c => c.id === id)
    if (index !== -1) {
      customers.splice(index, 1)
      callback(null, { success: true })
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Customer not found',
      })
    }
  },
})

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error('Error binding server:', error)
    return
  }
  server.start()
  console.log(`Server running at http://${port}`)
  console.log('gRPC server running on port 50051')
})
