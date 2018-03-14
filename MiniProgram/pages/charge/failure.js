const app = getApp()

Page({

  /**
   * 页面的初始数据
   */ 
  data: {
     
  },
  //取消扫描并回到map页面
  cancel:function(){
    wx.getStorage({
      key: 'deviceId',
      success: function(res) {
        var deviceId = res.data;
        console.log("deviceId", deviceId)
        let buffer = new ArrayBuffer(1)
        let dataView = new DataView(buffer)
        dataView.setUint8(0, 0x00)
        wx.writeBLECharacteristicValue({//写入数据
          deviceId: deviceId,
          serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
          characteristicId: "0000FFF1-0000-1000-8000-00805F9B34FB",
          value: buffer,
          success: function (res) {
            console.log("关闭写入成功");
            wx.closeBLEConnection({
              deviceId: deviceId,
              success: function (res) {
                console.log(res)
              }
            })
            wx.readBLECharacteristicValue({//
              deviceId: deviceId,
              serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
              characteristicId: "0000FFF1-0000-1000-8000-00805F9B34FB",
              success: function (res) {
                console.log(JSON.stringify(res))
              }
            }),
              wx.onBLECharacteristicValueChange(function (characteristic) {
              })
          },
          fail: function (res) {
            console.log("写入失败")
          },
          complete: function () {
            wx.closeBLEConnection({
              deviceId: deviceId,
              success: function (res) {
                console.log(res)
              }
            })
            wx.reLaunch({
              url: '../map/map',
            })
          }
        });
      },
      fail:function(){
        wx.reLaunch({
          url: '../map/map',
        })
      }
    })
 
  },
  //重新扫描
  again:function(){
    wx.scanCode({
      success: (res) => {
        var code = res
        wx.openBluetoothAdapter({
          success: function (res) {
            var url = code.result; //获取url中参数  
            // var theRequest = new Object();
            url = url.split("?");
            var code1 = url[0];
            url = url[1].split("=");
            var id = url[1];
            console.log(url);
            console.log("id", id);
            console.log("code1", code1)
            if (code1 == "http://www.ewwj.net"){
              wx.getStorage({
                key: 'login',
                success: function (res) {
                  console.log("获取登陆信息")
                  console.log(res)
                  var token = res.data.data.accessToken
                  var userId = res.data.data.userId
                  wx.request({//获取wireless状态
                    url: app.globalData.Route + "/api/wireless/findWirelessType",
                    data: {
                      userId: userId,
                      wirelessCode: id,
                    },
                    method: "POST",
                    header: {
                      'Content-Type': 'application/x-www-form-urlencoded;'
                    },
                    success: function (res) {
                      console.log(res)
                      if (res.data.code !== 1) {
                        console.log("设备有订单")
                        wx.showModal({
                          title: '提示',
                          content: '设备正在使用中，请扫描其它设备',
                          success: function (res) {
                            if (res.confirm) {
                              console.log('用户点击确定')
                              wx.reLaunch({
                                url: '../map/map',
                              })
                            } else if (res.cancel) {
                              console.log('用户点击取消')
                              wx.reLaunch({
                                url: '../map/map',
                              })
                            }
                          }
                        })
                      } else {
                        console.log("跳转到链接中")
                        wx.redirectTo({
                          url: '../charge/charge?id=' + id,
                        });
                      }
                    },
                    fail: function (res) {
                      console.log(res)
                      wx.showLoading({
                        title: '网络已断开',
                        mask: true,
                      })
                      setTimeout(function () {
                        wx.reLaunch({
                          url: '../map/map',
                        })
                      }, 2000)
                    },
                  })
                },
              })
            }else{
              wx.showModal({
                title: '错误',
                content: '您的二维码扫描错误！',
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.reLaunch({
                      url: '../map/map',
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                    wx.reLaunch({
                      url: '../map/map',
                    })
                  }
                }
              })
            }
          
          },
          fail: function () {
            wx.redirectTo({
              url: '../map/map'
            });
          }
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.overtime = false;//设置超时true 或false
    app.globalData.chargeNot=true;
    if (app.globalData.chargeNot) {
      wx.getStorage({//如果用户放弃支付则自动断开蓝牙
        key: 'deviceIdFailure',
        success: function (res) {
          console.log("蓝牙打印出来的--------------")
          console.log(app.globalData.chargeNot)
          var deviceId = res.data;
          console.log(deviceId)
          wx.closeBLEConnection({
            deviceId: deviceId,
            success: function (res) {
              console.log("关闭蓝牙成功");
            },
          })
        },
        fail:function(){
          console.log("获取deviceIdFailure失败")
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})