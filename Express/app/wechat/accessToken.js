/*
 获取 accsee_token 
  是什么?微信调用接口全局唯一凭据

  特点
    1.唯一的
    2.有效期为 2小时 ,提前5分钟请求
    3.接口权限 每天2000次


    请求地址
      https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    请求方式
      GET

    设计思路:
      1. 首次本地没有 , 发送请求获取 access_token,保存下来(本地文件)
      2. 第二次获以后:
        - 先去本地读取文件,判断它是否过期
            -过期了
              - 重新请求 获取 access_token,保存下来覆盖之前的额文件(保证文件是为唯一的)
            -没有过期
              - 直接使用

    整理思路:
      读取本地文件 (readAccessToken)
       - 本地有文件
          - 判断它是否过期 (isValidAccessToken)
             -过期了
              - 重新请求 获取 access_token (getAccessToken),保存下来覆盖之前的额文件(保证文件是为唯一的) (saveAccessToken)
            -没有过期
              - 直接使用
       - 本地没有文件
          - 发送请求获取 access_token (getAccessToken),保存下来(本地文件) (saveAccessToken),直接使用 

 */

//只需引入request-promise-native
const rp = require('request-promise-native')
//引入fs模块
const { writeFile, readFile, access } = require('fs')

//引入config模块
const { appID, appsecret } = require('../config')
const { json } = require('body-parser')
const { resolve } = require('path')
const { rejects } = require('assert')

// 定义类,获取access_token
class Wechat {
  constructor() {}

  // 用来获取 access_token
  getAccessToken() {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`

    //发送请求
    /*
      request
      request-promise-native  返回值是一个promise对象
    */

    return new Promise((resolve, reject) => {
      rp({ method: 'GET', url, json: true })
        .then((res) => {
          console.log(res)
          /* 
          {
           access_token: '34_Too2STvwAM1yvwYv2XofR-Z0PBxc0ROz6ICGhfGpgVZ8Nv7F2z2MED4U_b3Fk_3p3zlvIYzIBxUJuVXgKA20xVwuryeUYtH91KPJcCukwPQWW9zdoPIsy-9zo3OixmRu7tLR2V_xf2e5Tt5_YERfAIAHNA',
           expires_in: 7200
          }
          */
          // 设置 access_token 的过期时间
          res.expires_in = Date.now() + (res.expires_in - 300) * 1000

          //将promise对象状态改成成功的状态
          resolve(res)
        })
        .catch((err) => {
          console.log(err)
          //将promise对象状态改成失败的状态
          reject('getAccessToken方法出了问题: ' + err)
        })
    })
  }

  // 用来保存access_token的方法
  // @param accessToken 要保存的凭据
  saveAccessToken(accesseToken) {
    // 将对象转化 json 字符串
    accesseToken = JSON.stringify(accesseToken)
    // 将access_token 保存衣蛾文件

    return new Promise((resolve, reject) => {
      writeFile('./accessToken.txt', accesseToken, (err) => {
        if (!err) {
          console.log('文件保存成功')
          resolve()
        } else {
          console.log('文件保存失败')
          reject('saveAccessToken 方法出了问题:' + err)
        }
      })
    })
  }

  // 用来读取access_token
  // @param accessToken 要保存的凭据
  readAccessToken() {
    // 读取本地文件中的access_token
    return new Promise((resolve, reject) => {
      writeFile('./accessToken.txt', (err, data) => {
        if (!err) {
          console.log('文件读取成功')
          //将json字符串转化成js对象
          data = JSON.parse(data)
          resolve(data)
        } else {
          console.log('文件读取失败')
          reject('readAccessToken 方法出了问题:' + err)
        }
      })
    })
  }

  // 用来检测access_token 是否有效的
  // @param accessToken
  isValidAccessToken(data) {
    //检测传入的参数是否有效的
    if (!data && data.access_token && data.expires_in) {
      //代表 access_token 无效的
      return false
    }

    // 检测access_token是否在有效期内
    /*  if (data.expires_in < Date.now()) {
      //过期了
      return false
    } else {
      //没有过期
      return true
    }
    */

    return data.expires_in > Date.now()
  }
}

//模拟测试
const w = new Wechat()

// 读取本地文件 (readAccessToken)
// - 本地有文件
//    - 判断它是否过期 (isValidAccessToken)
//       -过期了
//        - 重新请求 获取 access_token (getAccessToken),保存下来覆盖之前的额文件(保证文件是为唯一的) (saveAccessToken)
//      -没有过期
//        - 直接使用
// - 本地没有文件
//    - 发送请求获取 access_token (getAccessToken),保存下来(本地文件) (saveAccessToken),直接使用

new Promise((resolve, rejects) => {
  w.readAccessToken()
    .then((res) => {
      //本地有文件
      // 判断它是否过期 (isValidAccessToken)
      if (w.isValidAccessToken(res)) {
        // 有效的
        resolve(res)
      } else {
        //过期了
        // 发送请求获取 access_token (getAccessToken)
        w.getAccessToken().then((res) => {
          // 保存下来(本地文件)(saveAccessToken) 直接使用
          w.saveAccessToken(res).then(() => {
            resolve(res)
          })
        })
      }
    })
    .catch((err) => {
      //本地没有文件
      // 发送请求获取 access_token (getAccessToken)
      w.getAccessToken().then((res) => {
        // 保存下来(本地文件)(saveAccessToken) 直接使用
        w.saveAccessToken(res).then(() => {
          resolve(res)
        })
      })
    })
}).then((res) => {
  console.log(res)
})
