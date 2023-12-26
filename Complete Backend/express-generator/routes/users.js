var express = require("express")
var router = express.Router()

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("users", {
    title: "users page",
    desc: "description for user page",
  })
})

module.exports = router
