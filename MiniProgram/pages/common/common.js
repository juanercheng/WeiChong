var root = '';//你的域名  
function req(url, data, cb) {
  wx.request({
    url: root + url, 
    data: data,
    method: 'POST',   //method请求方式，必须要使用大写的GET或POST！！
    header: { 'content-type': 'application/json' },   //content-type，必须要使用小写，使用大写不能正常发起请求！
    success: function (res) {
      return typeof cb == "function" && cb(res.data)
    },
    fail: function () {
      return typeof cb == "function" && cb(false)
    }
  })
}

//其中module.exports是将req方法暴露出去使得别的文件中可以使用该方法，由于js函数是异步执行的，所以return 的是回调函数，而不是具体的数据
module.exports = { req: req }  
