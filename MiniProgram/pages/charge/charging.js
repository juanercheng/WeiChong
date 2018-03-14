var app = getApp()
function PrefixInteger(num, n) {
  return (Array(n).join(0) + num).slice(-n);
}
Page({
  /**
   * 页面的初始数据 app.globalData.chargingOrder
   */
  data: {
    chargeStart: true,
    chargeBad: false,
    chargeEnd: false,
    clock: '',
    time: '',
    orderNo: '',
    idCode: '',
    total_micro_second: '',
    text: '',
    much: ''
  },
  canvasIdErrorCallback: function (e) {
  },
  //结束充电
  again: function () {
    wx.reLaunch({
      url: '../map/map',
    })
  },
  //返回首页
  back: function () {
    wx.reLaunch({
      url: '../map/map',
    })
  },
  //继续充电
  continue: function () {
    wx.navigateTo({
      url: '../pay/payList',
    })
  },
  //重新充电 继续扫描
  recharge: function () {
    var that = this
    wx.request({//充电完成接口
      url: app.globalData.Route + "/api/chargeorder/confirmChargeOrder2",
      data: {
        orderNo: that.data.orderNo
      },
      method: "POST",
      header: {
        'Content-Type': 'application/x-www-form-urlencoded;'
      },
      success: function (res) {
      },
      fail: function (res) {
      },
      complete: function () {
        wx.reLaunch({
          url: '../map/map',
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    app.globalData.homeRefresh = true;
    app.globalData.showTime = false;
    app.globalData.overtimeOne = false;
    app.globalData.chargingState = true;
    var that = this;
    that.data.chargeStart = true;
    var idCode = app.globalData.idCode;
    that.setData({ idCode })
    app.globalData.chargeNot = false;
    app.globalData.scanNot = true;
    wx.getStorage({
      key: 'characteristics',
      success: function (res) {
      },
    })

    console.log(options,'时间')

    var time = options.time
    var total_micro_second = time
    /* 毫秒级倒计时 */
    function countdown(that) {
      // 渲染倒计时时钟
      that.setData({
        clock: dateformat(total_micro_second)
      });
      if (total_micro_second <= 0) {
        that.setData({
          chargeStart: false,
          chargeEnd: true,
        });
        wx.request({//充电完成接口
          url: app.globalData.Route + "/api/chargeorder/confirmChargeOrder2",
          data: {
            orderNo: that.data.orderNo
          },
          method: "POST",
          header: {
            'Content-Type': 'application/x-www-form-urlencoded;'
          },
          success: function (res) {
          },
          fail: function (res) {
          },
        })
        // timeout则跳出递归
        return;
      }
      var t = setTimeout(function () {
        // 放在最后--
        total_micro_second -= 10;
        countdown(that);
      }, 10)
    }
    // 时间格式化输出，如3:25:19 86。每10ms都会调用一次
    function dateformat(micro_second) {
      // 秒数
      var second = Math.floor(micro_second / 1000);
      // 小时位
      var hr = Math.floor(second / 3600);
      // 分钟位
      var min = Math.floor((second - hr * 3600) / 60);
      // 秒位
      var sec = (second - hr * 3600 - min * 60);
      // 毫秒位，保留2位
      var micro_sec = Math.floor((micro_second % 1000) / 10);
      sec < 10 && (sec = "0" + sec);
      hr < 10 && (hr = "0" + hr);
      min < 10 && (min = "0" + min);
      if (hr <= 0) {
        return min + ":" + sec
      } else {

        return hr + ":" + min + ":" + sec
      }
    }
    countdown(this);
    //获取移动设备信息
    // wx.getSystemInfo({
    //   success: function (res) {
    //     var e = wx.getSystemInfoSync();
    //     var deviceType = res1.model;
    if (app.globalData.chargeingTime) {
      console.log(123)
      
      // wx.request({//开始充电接口
      //   url: app.globalData.Route + "/api/chargeorder/startChargeOrder",
      //   data: {
      //     userId: app.globalData.userId,
      //     wirelessCode: app.globalData.Id,
      //     deviceType: deviceType,
      //     orderType: "1",
      //     tcid: app.globalData.idCode,
      //     accessToken: app.globalData.token
      //   },
      //   method: "POST",
      //   header: {
      //     'Content-Type': 'application/x-www-form-urlencoded;'
      //   },
      //   success: function (res) {

      // wx.hideLoading()
      wx.getStorage({
        key: 'orderNo',
        success: function(res) {
          wx.hideLoading()
          console.log(res,'获取订单和时间')

          app.globalData.chargeingTime = false
          app.globalData.tap = true;
          //订单编号
          var orderNo = res.data.orderNo;
          that.setData({
            orderNo: orderNo
          });
          console.log(res.data.time)
          //赋值
          var chargeTime = res.data.time/1000/60;//获取充电时间
          chargeTime = parseInt(chargeTime);
          var str = Array.prototype.map.call(new Uint8Array(chargeTime), x => ('00' + x.toString(16)).slice(-2)).join('');
          var deviceId;
          // var chargeTime = res.data.object.tctime;//获取充电时间
          console.log(chargeTime)
          chargeTime = chargeTime.toString(16);
          console.log(chargeTime)
          chargeTime = chargeTime.toUpperCase();
          console.log(chargeTime)
          chargeTime = PrefixInteger(chargeTime, 2);
          //根据充电不同时间来写入不同的指令
          wx.getStorage({
            key: 'deviceId',
            success: function (res) {
              var deviceId = res.data;
              let buffer = new ArrayBuffer(1)
              let dataView = new DataView(buffer)
              dataView.setUint8(0, 0x01)
              wx.writeBLECharacteristicValue({//写入数据
                deviceId: deviceId,
                serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
                characteristicId: "0000FFF1-0000-1000-8000-00805F9B34FB",
                value: buffer,
                success: function (res) {
                  let buffer = new ArrayBuffer(3)
                  let dataView = new DataView(buffer);
                  dataView.setUint8(0, 0x01)
                  dataView.setUint8(1, 0x00)
                  dataView.setUint8(2, "0x" + chargeTime)
                  wx.writeBLECharacteristicValue({
                    deviceId: deviceId,
                    serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
                    characteristicId: "0000FFF4-0000-1000-8000-00805F9B34FB",
                    value: buffer,
                    success: function (res) {
                      var chargeS = 1;
                      wx.setStorage({
                        key: 'chargeS',
                        data: chargeS,
                      })
                    },
                  })
                  wx.readBLECharacteristicValue({//
                    deviceId: deviceId,
                    serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
                    characteristicId: "0000FFF1-0000-1000-8000-00805F9B34FB",
                    success: function (res) {
                    }
                  }),
                    wx.onBLECharacteristicValueChange(function (characteristic) {
                    })
                },
                fail: function (res) {
                  wx.writeBLECharacteristicValue({
                    deviceId: deviceId,
                    serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
                    characteristicId: "0000FFF1-0000-1000-8000-00805F9B34FB",
                    value: buffer,
                    success: function (res) {
                      let buffer = new ArrayBuffer(3)
                      let dataView = new DataView(buffer);
                      dataView.setUint8(0, 0x01)
                      dataView.setUint8(1, 0x00)
                      dataView.setUint8(2, "0x" + chargeTime)
                      wx.writeBLECharacteristicValue({
                        deviceId: deviceId,
                        serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
                        characteristicId: "0000FFF4-0000-1000-8000-00805F9B34FB",
                        value: buffer,
                        success: function (res) {
                          var chargeS = 1;
                          wx.setStorage({
                            key: 'chargeS',
                            data: chargeS,
                          })
                        },
                      })
                      wx.readBLECharacteristicValue({//
                        deviceId: deviceId,
                        serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
                        characteristicId: "0000FFF1-0000-1000-8000-00805F9B34FB",
                        success: function (res) {
                        }
                      }),
                        wx.onBLECharacteristicValueChange(function (characteristic) {
                        })

                    },
                    fail: function (res) {

                    }


                  })
                }

              });
            },
          })
        },
      })

      
     
      
      // fail: function (res) {
      //   console.log(res)
      //   wx.hideLoading()
      //   wx.showModal({
      //     title: '温馨提示',
      //     content: '请检查网络连接',
      //     showCancel: false,
      //     confirmText: '知道了',
      //     success: function (res) {
      //       if (res.confirm) {
      //         console.log('用户点击确定')
      //         wx.redirectTo({
      //           url: '../charge/charging?time=' + app.globalData.time
      //         })
      //       }
      //     }
      //   })
      // }
      // })
    }else{
      wx.hideLoading()
    }
    //   },
    // })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // var that = this
    // // 使用 wx.createContext 获取绘图上下文 context
    // var context = wx.createCanvasContext('circular')
    // //画圆
    // context.beginPath();
    // context.setStrokeStyle("#0dadb1")
    // context.moveTo(260, 130)
    // context.arc(130, 130, 130, 0, 2 * Math.PI, true);
    // context.stroke();
    // context.clip();
    // var cw = 260
    // var ch = 260;
    // var sX = 0;
    // var sY = 260 / 2;
    // var seed = 0.5;
    // var axisLength = 260;//轴长
    // var waveWidth = 0.019;//波浪宽度,越小越宽
    // var waveHeight = 15;//波浪高度，越大越高
    // var seed = 0.5;//波浪速度
    // var xoffset = 0;//偏移量
    // var xoffset1 = 2;//偏移量
    // var drawSin = function (xoffset) {
    //   context.beginPath();
    //   context.setFillStyle("#cff3ea");//颜色
    //   //在整个长轴上取点
    //   for (var x = sX; x < sX + axisLength; x += 20 / axisLength) {
    //     //此处坐标(x,y)的取点，依靠公式 “振幅高*sin(x*振幅宽 + 振幅偏移量)”
    //     var y = -Math.sin((sX + x) * waveWidth - xoffset);
    //     var dy = ch * 0.65
    //     context.lineTo(x, dy + y * waveHeight);
    //   }
    //   //封闭路径
    //   context.lineTo(axisLength, ch);
    //   context.lineTo(sX, ch);
    //   context.fill();
    //   context.restore();
    // };
    // var drawSin1 = function (xoffset) {
    //   context.save();
    //   context.beginPath();
    //   const grd = context.createLinearGradient(130, 260, 130, 130)
    //   grd.addColorStop(0, "#0dadb1")
    //   grd.addColorStop(1, "#11c692")
    //   context.setFillStyle(grd);//颜色
    //   //在整个长轴上取点
    //   for (var x = sX; x < sX + axisLength; x += 20 / axisLength) {
    //     //此处坐标(x,y)的取点，依靠公式 “振幅高*sin(x*振幅宽 + 振幅偏移量)”
    //     var y = -Math.sin((sX + x) * waveWidth - xoffset);
    //     var dy = ch * 0.65;
    //     context.lineTo(x, dy + y * waveHeight);
    //   }
    //   //封闭路径
    //   context.lineTo(axisLength, ch);
    //   context.lineTo(sX, ch);
    //   context.fill();
    //   context.restore();
    // };
    // var drawTextHint = function () {
    //   context.save();
    //   context.setFillStyle("white");
    //   context.setFontSize(20)
    //   context.fillText('正在充电', 90, 230);
    //   context.restore();
    // }
    // var render = function () {
    //   var seed1 = seed * 10;
    //   xoffset = xoffset * 10 + seed1;
    //   xoffset1 = xoffset1 * 10 + seed1;
    //   xoffset /= 10;
    //   xoffset1 /= 10;
    //   drawSin(xoffset);
    //   drawSin1(xoffset1);
    //   drawTextHint()
    //   context.draw();
    // }
    // render()

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    if (app.globalData.showTime) {
      wx.showLoading({
        title: '正在加载',
      })
      var that = this;
      wx.getStorage({
        key: 'orderNo',
        success: function (res) {
          var orderNo = res.data.orderNo;
          var allTime = res.data.time
          wx.hideLoading()
          wx.request({//更新充电时间
            url: app.globalData.Route + "/api/chargeorder/updateChargeOrder ",
            data: {
              orderNo: orderNo,
              accessToken: app.globalData.token,
            },
            method: "POST",
            header: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            success: function (res) {
              wx.hideLoading()
              if (res.data.code == 0) {
                that.setData({
                  chargeStart: false,
                  chargeEnd: true,
                });
              }
              if (that.data.chargeStart == true) {
                // var allTime = res.data.object.duration * 60 * 1000
                var start = res.data.object.createTime
                var now = res.data.object.lastModifiedTime
                var time = now - start;
                time = allTime - time;
                var time = time;
                wx.redirectTo({
                  url: '../charge/charging?time=' + time,
                })
              }
            },
            fail: function (res) {
            }
          })
        },
        fail: function (res) {

        }
      })
    }
    app.globalData.showTime = true;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
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