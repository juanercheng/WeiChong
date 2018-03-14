// pages/pay/chooseList.js
var app = getApp()
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
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.setNavigationBarTitle({
      title: '套餐选择'
    })
  },
  Topay: function (e) {

    //判断蓝牙是否打开
    wx.openBluetoothAdapter({
      success: function (res) {
        //初始化蓝牙配置器开始
        var that = this;
        wx.getBluetoothAdapterState({
          success: function (res) {
            var available = JSON.stringify(res.available);
            var discovering = JSON.stringify(res.discovering);

            if (available && discovering) {
              //蓝牙搜索开始
              wx.startBluetoothDevicesDiscovery({
                services: [],
                allowDuplicatesKey: false,
                success: function (res) {

                  //扫描附近设备
                  wx.getBluetoothDevices({
                    success: function (res) {
                      //连接deviceID设备

                      wx.createBLEConnection({
                        deviceId: '7A:56:9F:A1:30:AC',
                        success: function (res) {
                          wx.showToast({
                            title: '连接成功',
                          })
                          wx.getBLEDeviceServices({
                            // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取 
                            deviceId: '7A:56:9F:A1:30:AC',
                            success: function (res) {

                              this.setData({
                                services: res.services

                              })
                              wx.getBLEDeviceCharacteristics({

                                // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
                                deviceId: '7A:56:9F:A1:30:AC',
                                // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
                                serviceId: services.uuid,
                                success: function (res) {
                                  for (var i = 0; i < res.characteristics.length; i++) {
                                    if (res.characteristics[i].properties.notify) {

                                      that.setData({
                                        notifyServicweId: that.data.services[0].uuid,
                                        notifyCharacteristicsId: res.characteristics[i].uuid,
                                      })
                                    }
                                    if (res.characteristics[i].properties.write) {
                                      that.setData({
                                        writeServicweId: that.data.services[0].uuid,
                                        writeCharacteristicsId: res.characteristics[i].uuid,
                                      })

                                    } else if (res.characteristics[i].properties.read) {
                                      that.setData({
                                        readServicweId: that.data.services[0].uuid,
                                        readCharacteristicsId: res.characteristics[i].uuid,
                                      })

                                    }
                                  }
                                  console.log('device getBLEDeviceCharacteristics:', res.characteristics);

                                  that.setData({
                                    msg: JSON.stringify(res.characteristics),
                                  })
                                },
                                fail: function () {
                                  console.log("fail");
                                },
                                complete: function () {
                                  console.log("complete");
                                }
                              })


                            },

                          })
                          //连接成功后停止扫描        
                          wx.stopBluetoothDevicesDiscovery({
                            success: function (res) {
                            }
                          })
                        },
                        //设备连接失败
                        fail: function (res) {
                          wx.showLoading({
                            title: '连接失败',
                          })
                          setTimeout(function () {
                            wx.hideLoading();
                          }, 2000);

                        }
                      })

                    },
                  })
                },
                //蓝牙搜索失败
                fail: function (err) {
                  console.log(err);
                }
              })
              //蓝牙搜索结束
            }
          }
        })

        //初始化蓝牙配置器结束
      },
      fail: function (res) {
        wx.showToast({
          title: '请开启蓝牙',
          icon: 'loading'
        })
        setTimeout(function () {
          wx.hideLoading();

        }, 2000)
      }
    })
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