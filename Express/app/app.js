// 引入express 模块
const express = require('express')

//引入auth
const auth = require('./wechat/auth')

//创建app引用对象
const app = express()

//验证服务器有效性
/* 
    1.微信服务器知道开发者服务器是哪个
      - 测试号管理页面上填写url开发者服务器地址
        - 使用ngrok 内网穿透  将本地端口号开启的服务映射外网跨域访问一个网址
        - ngrok http 3000
      - 填写 token 
        - 参与微信签名加密的一个参数
    2. 开发者服务器 - 验证消息是否来自于微信服务器
      目的:计算得出signature微信加密签名,和微信传递过来的signature进行对比,如果一样,说明消息来自微信服务器
           如果不一样 说明不是微信服务器发送的消息
      -1. 将参与微信加密签名的三个参数(timestamp\nonce\token),按照字典序排序并组合在一起形成一个数组
      -2. 将数组里所有参数拼接成一个字符串,进行sha1 加密
      -3. 加密完成就生成了一个signature , 和微信发送过来的进行对比
          - 如果一样,说明消息来自于微信服务器,返回 echostr 给微信服务器
          - 如果不一样 , 说明不是微信服务器发送的消息,返回error 
  */

//定义配置对象 == >以模块化 index.js
// const config = {
//   token: 'heimaqianduan33qi',
//   appID: 'wxa6aea6da4aac04a7',
//   appsecret: '9f51d0e64b36b8065c5a7be64b33d411',
// }

//接受处理所有消息
app.use(auth()) // 已模块化 ==> auth.js

//监听端口号
app.listen(3000, () => console.log('服务器启动成功了~'))
