// pages/pay/payList.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeArray: [{
      id: 0,
      time: '15分钟',
      price: 0.5
    }, {
      id: 1,
      time: '30分钟',
      price: 0.8
    }, {
      id: 2,
      time: '1小时',
      price: 1.2
    }],
    dataPay: "",
    showModalStatus: false,
    isFocus: false,//控制input 聚焦
    wallets_password_flag: false,//密码输入遮罩
    payChargeOne:true,
    payChargeTwo:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      payChargeTwo: false,
      payChargeOne: true
    })
    app.globalData.overtime=false;//设置超时true 或false
    app.globalData.deviceIdSesseion = true;//防止蓝牙缓存
    app.globalData.overtimeOne = false;
    wx.request({//套餐接口
      url: app.globalData.Route + "/api/chargeorder/findRechargemodels",
      header: {
        'Content-Type': 'application/ json;charset=UTF - 8;'
      },
      method: "POST",
      success: function (res) {
        console.log(res)
        app.globalData.chargeNot=true;
        that.setData({
          timeArray: res.data.object.content
        })
      },
      fail: function (res) {},
    })
    wx.getStorage({
      key: 'login',
      success: function (res) {
        that.data.token = res.data.data.accessToken;
      }
    })
    wx.setNavigationBarTitle({
      title: '套餐选择'
    })
    //设置带过来参数选中样式
    that.setData({
      'currentItem': options.id
    })
  },
  tagChoose: function (options) {
    var that = this
    that.setData({
      payChargeTwo:true,
      payChargeOne:false
    })
    var id = options.currentTarget.dataset.id;
   
    that.data.timeArray.map(function (value) {
      if (value.id == id) {
        that.setData({
          dataPay: value
        })
      }
    })
    //设置当前样式
    that.setData({
      'currentItem': id
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  //支付
  pay: function (options) {
    console.log('token',app.globalData.token)
    wx.onBLEConnectionStateChange(function(res){
      if(!res.connected){
        wx.showLoading({
          title: '设备异常断开,请重试',
          mask:true
        })
        setTimeout(function(){
          wx.hideLoading();
          wx.redirectTo({
            url: '../map/map',
          })
        },2000)
      }
    })
    var that = this;
    
    var idCode = that.data.dataPay.id;
    var tctime = that.data.dataPay.tctime;
    // app.globalData.tctime = tctime
    app.globalData.idCode = idCode;
    if (idCode==null){
      wx.showToast({
        title: '请选择支付套餐',
        icon:"success",
        mask:true,
        duration:1500,
      })
    }else{
      console.log(that.data.dataPay)
      var time = that.data.dataPay.tctime * 60 * 1000
      var price = that.data.dataPay.tcmoney * 100;
      app.globalData.time = time;
      price.toString();
      wx.getSystemInfo({//获取设备信息
        success: function(res) {
          var res1 = wx.getSystemInfoSync();
          var deviceType = res1.model;
          console.log({
            wirelessCode: app.globalData.Id,
            deviceType: deviceType,
            descript: time,
            tcid: idCode,
            accessToken: app.globalData.token,
            total_fee: "1"})
          wx.request({//支付接口
            url: app.globalData.Route + "/api/smallroutinepay/pay",
            data: {
              wirelessCode: app.globalData.Id,
              deviceType: deviceType,
              // descript: time,
              tcid: idCode,
              accessToken: app.globalData.token,
              // total_fee: "1"
              // total_fee: price
            },
            method: "POST",
            header: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            success: function (res) {
              console.log(res, '支付')
              console.log(res.data.object.weixinVo)
              if (res.statusCode == 500) {
                wx.showLoading({
                  title: '支付失败',
                  mask: true,
                })
                setTimeout(function () {
                  wx.navigateTo({
                    url: '../map/map',
                  })
                }, 2000)
              } else {
                var payData = res.data.object.weixinVo.object;
                var orderNo = res.data.object.chargeOrderVo.orderNo
                time = res.data.object.chargeOrderVo.smallTime * 60 * 1000
                console.log(time)
                var data = { time, orderNo }
                wx.setStorage({
                  key: 'orderNo',
                  data: data,
                  success: function (res) {
                  },
                  fail: function (res) {
                  }
                })
                wx.setStorage({
                  key: 'orderType',
                  data: res,
                })
                wx.requestPayment({
                  "timeStamp": payData.timeStamp,
                  "nonceStr": payData.nonceStr,
                  "package": payData.prepayid,
                  "signType": 'MD5',
                  "paySign": payData.sign,
                  "success": function (res) {
                    console.log(res, '成功')
                    that.setData({
                      payChargeTwo: false,
                      payChargeOne: true
                    })
                    app.globalData.homeRefresh = true;
                    if (res.errMsg == "requestPayment:ok") {
                      wx.redirectTo({
                        url: '../charge/charging?time=' + time
                      })
                    }
                  },
                  "fail": function (res) {
                    console.log(res,'失败')
                  },
                })
              }
            },
          })
        },
      })
      
    }
  }
})