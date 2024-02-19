const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  res.send("users home page")
})

router.get("/contact", (req, res) => {
  res.send("users contact page")
})

// advance routing

router
  .route("/:id")
  .get((req, res) => {
    console.log(req.user)
    res.send(`contact data for id ${req.params.id}`)
  })
  .put((req, res) => {
    res.send(`contact data updated for ${req.params.id}`)
  })
  .delete((req, res) => {
    res.send(`contact data delete for id ${req.params.id}`)
  })

  const users = [{name: "rupam"}, {name: "das"}]

  router.param("id", (req, res, next, id)=>{
    req.user = users[id]
    next()
  })

module.exports = router
