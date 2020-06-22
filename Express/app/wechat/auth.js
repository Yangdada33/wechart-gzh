// 验证服务器有效性的模块

//引入sha1 模块
const sha1 = require('sha1')

// 引入config 模块
const config = require('../config')

module.exports = () => {
  return (req, res, next) => {
    //微信服务器提交的参数
    // console.log(req.query)
    /*
      {
    signature: 'c38f6e192932a266e83aa557e4382d2384814eb1',  // 微信的加密签名
    echostr: '4968738947827989503',   // 微信的随机字符串
    timestamp: '1592666595',          // 微信的发送请求的时间戳
    nonce: '1789755157'               // 微信的随机数字
  }
    */

    const { signature, echostr, timestamp, nonce } = req.query
    const { token } = config

    // -1. 将参与微信加密签名的三个参数(timestamp\nonce\token),按照字典序排序并组合在一起形成一个数组
    const arr = [timestamp, nonce, token]
    const arrSort = arr.sort()
    console.log(arrSort)

    // -2. 将数组里所有参数拼接成一个字符串,进行sha1 加密
    const str = arr.join('')
    console.log(str)

    const sha1Str = sha1(str)
    console.log(sha1Str)

    // -3. 加密完成就生成了一个signature , 和微信发送过来的进行对比
    if (sha1Str === signature) {
      // - 如果一样,说明消息来自于微信服务器,返回 echostr 给微信服务器
      res.send(echostr)
    } else {
      // - 如果不一样 , 说明不是微信服务器发送的消息,返回error
      res.end('error')
    }
  }
}
