var express = require("express")
var router = express.Router()

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" })
})

// 测试
router.get("/abaaba", function (req, res) {
  res.send("阿巴阿巴阿巴!!!")
})

//  前端用户登录信息
router.post("/reg", function (req, res) {
  console.log(req.body) //接受前端通过post提交的数据
})

module.exports = router
