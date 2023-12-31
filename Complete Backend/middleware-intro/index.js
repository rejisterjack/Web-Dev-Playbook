// Built in middleware
// Application level middleware
// Router level middleware
// Error handling middleware
// Third party middleware

const express = require("express")
const path = require("path")
const app = express()
const router = express.Router()
const port = 8000
const logger = require("morgan")
const multer = require("multer")
const upload = multer({ dest: "./public/uploads" })

// built in middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.use(logger("dev"))

// application level middleware
const loggerMiddleware = (req, res, next) => {
  console.log(`${new Date()} --- Request [${req.method}] [${req.url}]`)
  next()
}
// router level middleware
const fakeAuth = (req, res, next) => {
  const authStatus = false
  if (authStatus) {
    console.log(`Authstatus is: ${authStatus}`)
  } else {
    throw new Error("user is unauthorize")
  }
  next()
}
// error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = req.statusCode ? res.statusCode : 500
  req.status= statusCode
  switch (statusCode) {
    case 401:
      res.json({
        title: "unauthorize",
        message: err.message,
      })
      break
    case 404:
      res.json({
        title: "not found",
        message: err.message,
      })
      break
    case 500:
      res.json({
        title: "server error",
        message: err.message,
      })
      break
    default:
      res.json({
        title: "unknown error",
        message: err.message,
      })
      break
  }
}
// third party middleware
app.post(
  "/upload",
  upload.single("image"),
  (req, res, next) => {
    console.log(req.file, req.body)
    res.send(req.file)
  },
  (err, req, res, next) => {
    res.status(400).send({ err: err.message })
  }
)

app.use(loggerMiddleware)
app.use("/api/users", router)
app.use(errorHandler)

const getUsers = (req, res) => {
  res.json({ message: "list of all users" })
}
const createUser = (req, res) => {
  res.json({ message: "user created successfylly" })
}

router.use(fakeAuth)
router.route("/").get(getUsers).post(createUser)

app.get("/", (req, res) => {
  res.send("server home page")
})

app.all("*", (req, res) => {
  res.status(404)
  throw new Error("Route not found")
})

app.listen(port, () => {
  console.log("server is running...")
})
