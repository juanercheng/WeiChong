//app.js
var http = require('pages/common/common.js')
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //这时这个req就是全局的了，在调用时我们可以使用getApp.func.req()来调用，具体如下
    func: {
      req: http.req
    }  
    wx.getSystemInfo({
      success: function(res) {
        var arrVersion = [];
        var nowVersion = res.version;
        var mustVersion = '6.5.2.99';
        arrVersion.push(nowVersion, mustVersion)
        function cmpVersions(a, b) {
          var i, diff;
          var regExStrip0 = /(\.0+)+$/;
          var segmentsA = a.replace(regExStrip0, '').split('.');
          var segmentsB = b.replace(regExStrip0, '').split('.');
          var l = Math.min(segmentsA.length, segmentsB.length);
          for (i = 0; i < l; i++) {
            diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
            if (diff) {
              return diff;
            }
          }
          return segmentsA.length - segmentsB.length;
        }
        var arrNew = arrVersion.sort(cmpVersions);
        if (arrNew[1] === mustVersion){
          wx.showModal({
            title: '微信版本过低',
            content: '请升级至最新版微信再打开',
            showCancel:false,
            confirmText:'知道了',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } 
            }
          })
        }
      },
    })
  },
  globalData: {
    title:'微冲',
    nextPage:0,
    // 正式
    // Route: 'https://app.ewwj.net/lvchong',
    // 测试
    Route:"http://114.215.84.189:8889/lvchong",
    // 本地测试
    // Route:'http://dazer.iask.in:8999/lvchong',
    chargeNot:false,
    overtime:true,
    overtimeOne:false,
    homeRefresh:false,
    scanNot:false,
    deviceIdSesseion:false,
    idCode:0,
    showTime:false,
    totalPages:0,
    much:0,
    text:'',
    token:'',
    tap:true,
    chargingState:false,
    chargeingTime:true,
    show:true,
    userId:0,
    tctime:0,
    time:'',
    bluetootha:false,
  }
})