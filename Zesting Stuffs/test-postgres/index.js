const { Pool } = require("pg")

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "8082",
  port: 5432,
})

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err)
  } else {
    console.log("Connected to PostgreSQL. Current timestamp:", res.rows[0].now)
  }
  pool.end()
})
