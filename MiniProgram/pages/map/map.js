var common = require('../common/common.js')
//获取应用实例
const app = getApp();
function MapabcEncryptToBdmap(bd_lat, bd_lon) {
  var point = new Object();
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var x = new Number(bd_lon - 0.0065);
  var y = new Number(bd_lat - 0.006);
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  var Mars_lon = z * Math.cos(theta);
  var Mars_lat = z * Math.sin(theta);
  point.lng = Mars_lon;
  point.lat = Mars_lat;
  return point;
}
Page({
  data: {
    latitude: 0,
    longitude: 0,
    userV: false,
    showCharge: true,
    chargeInfomation: false,
    user: "",
    chargeImg: "",
    chargeAdress: "",
    chargelength: "",
    chargeName: "",
    chargeS: '../../images/charge.png',
    usertop: 0,
    userleft: 0,
    userhead: false,
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
    userImage: '',
    userInfo: {},
    hasLocation: true,
    height: 'auto',

    scale: 13,
    token: "",
    wirelessList: {},
    markers: [],
    showDialog: true,
    controls: [],
  },

  //转发按钮
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '微充驿站',
      path: 'pages/map/map',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  //关闭弹框
  cancel: function () {
    var that = this;
    that.setData({
      showDialog: true,
      userhead: true
    })
  },
  cancelCharge: function () {
    var that = this;
    that.setData({
      showCharge: true
    })
  },
  //跳转关于页面
  about: function () {
    wx.navigateTo({
      url: '../about/about',
    })
  },

  controltap: function (e) {
  },

  //事件处理函数
  bindViewTap: function (options) {
    // 1.页面初始化 options为页面跳转所带来的参数
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  charge: function () {
    var that = this;
    that.setData({
      showCharge: false,
      showDialog: true
    })
  },
  onLoad: function () {
    app.globalData.nextPage = 0
    app.globalData.showTime = false;
    if (app.globalData.overtimeOne) {
      app.globalData.overtime = false;
    }
    var userInfo = {};
    var lng = 13;
    var lat = 14;
    var markers = [];
    var that = this;
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    if (app.globalData.chargeNot) {
      wx.getStorage({//如果用户放弃支付则自动断开蓝牙
        key: 'deviceId',
        success: function (res) {
          var deviceId = res.data;
          wx.closeBLEConnection({
            deviceId: deviceId,
            success: function (res) {
              wx.hideLoading()
            },
            fail: function () {
            }
          })
        },
      })
    }
    var chargeS = '../../images/charge.png';
    that.setData({
      chargeInfomation: false,
    })
    // 登录
    wx.login({
      success: res => {
        var code = res.code;
        console.log(code)
        wx.getSetting({
          success: res => {
            if ((res.authSetting['scope.userInfo']) && res.authSetting['scope.userLocation']) {
              console.log(1)
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  console.log(res);
                  var getUserInfo = res;
                  var userInfo = res.userInfo;
                  that.setData({
                    user: res.userInfo.avatarUrl
                  })
                  // console.log(userInfo.city)
                  // var cityStr = userInfo.city
                  // cityStr = cityStr.split('')
                  // console.log(cityStr)
                  // for (var w = 0; w < cityStr.length;w++){
                  //   console.log(userInfo.city[w])
                  //   if (userInfo.city[w] == ' '){
                  //     console.log(1)
                  //     userInfo.city[w] = "a"
                  //   }
                  // }
                  // console.log(userInfo.city)
                  wx.request({//登录获得token
                    url: app.globalData.Route + "/api/smallroutinelogin/getOpenId?code=" + code
                    + "&userName=" + userInfo.nickName + "&avatarUrl=" + userInfo.avatarUrl + "&area=" +
                    userInfo.area + "&address=" + userInfo.address + "&province=" + userInfo.province,
                    method: "POST",
                    header: {
                      'Content-Type': 'application/ json;charset=UTF - 8;'
                    },
                    success: function (res) {
                      console.log(res)
                      app.globalData.token = res.data.accessToken;
                      app.globalData.userId = res.data.userId;
                      console.log(app.globalData.token)
                      //将登录信息缓存到本地
                      wx.setStorage({
                        key: "login",
                        data: res
                      })
                      wx.getLocation({//获得所在位置
                        success: function (res) {
                          that.data.longitude = res.longitude;
                          that.data.latitude = res.latitude;
                          that.setData({
                            longitude: res.longitude,
                            latitude: res.latitude
                          })
                          wx.setStorage({
                            key: 'location',
                            data: res,
                            success: function (res) {
                              wx.request({//套餐接口
                                url: app.globalData.Route + "/api/chargeorder/findRechargemodels",
                                header: {
                                  'Content-Type': 'application/ json;charset=UTF - 8;'
                                },
                                method: "POST",
                                success: function (res) {
                                  that.setData({
                                    timeArray: res.data.object.content
                                  })
                                  wx.getStorage({
                                    key: 'login',
                                    success: function (res) {
                                      var userId = res.data.data.userId;
                                      var token = res.data.data.accessToken;
                                      wx.setStorageSync('token', token)
                                      wx.setStorageSync('userId', userId)
                                      wx.request({//请求附近电桩
                                        url: app.globalData.Route + "/api/wireless/findWirelessList?lng=" + that.data.longitude + "&lat=" + that.data.latitude + "&accessToken=" + token + "&wireType=1" + "&pageSize=300",
                                        method: "POST",
                                        header: {
                                          'Content-Type': 'application/ json;charset=UTF - 8;'
                                        },
                                        success: function (res) {
                                          wx.hideLoading()
                                          for (let i = 0; i < res.data.object.content.length; i++) {
                                            markers.push(res.data.object.content[i])
                                          }
                                          markers.map(function (value) {
                                            var position = MapabcEncryptToBdmap(value.lat, value.lng);
                                            value.iconPath = "/images/positionL.png";
                                            value.title = value.address;
                                            value.title = "";
                                            value.width = 30;
                                            value.height = 36;
                                            var latitude = parseFloat(position.lat);
                                            value.latitude = latitude;
                                            var longitude = parseFloat(position.lng);
                                            value.longitude = longitude;
                                          })
                                          wx.setStorage({
                                            key: 'markers',
                                            data: markers,
                                          })
                                          that.setData({
                                            markers: markers,
                                            userhead: true
                                          })
                                        },
                                        fail: function (res) {
                                          wx.hideLoading()
                                          wx.showToast({
                                            title: '请检查网络链接',
                                          })
                                        }
                                      })
                                    },
                                  })
                                },
                                fail: function (res) { },
                              })
                            },
                          })
                        },
                        fail: function () {
                          wx.showLoading({
                            title: '获取定位失败！',
                          })
                          setTimeout(function () {

                            wx.hideLoading()
                          }, 2000)
                        },
                        complete: function () {
                          wx.getStorage({
                            key: 'login',
                            success: function (res) {
                              that.setData({
                                token: res.data.data.accessToken
                              })
                              var token = res.data.data.accessToken;
                              wx.setStorageSync("token", token);
                              wx.setStorageSync("userId", res.data.data.userId);
                              wx.request({//判断是否充电
                                url: app.globalData.Route + "/api/chargeorder/findChargeOrder?userId=" + res.data.data.userId + "&accessToken=" + token,
                                method: "POST",
                                header: {
                                  'Content-Type': 'application/ json;charset=UTF - 8;'
                                },
                                success: function (res) {
                                  console.log(res, '判断是否充电')
                                  wx.setStorageSync('charge1', res.data.code);
                                  if (res.data.code == 0) {
                                    app.globalData.homeRefresh = false;
                                    that.setData({
                                      chargeS: '../../images/charge.png',
                                    })
                                    // chargeS = '../../images/charge.png';
                                    wx.getSystemInfo({
                                      success: function (res) {
                                        wx.hideLoading()
                                        var listLocation = 500
                                        if (res.windowHeight > 639) {
                                          listLocation = 660;
                                        } else if (res.windowHeight >= 603 && res.windowHeight <= 639) {
                                          listLocation = 590;
                                        } else if (res.windowHeight < 603) {
                                          listLocation = 560;
                                        } else {
                                          listLocation = 500
                                        }
                                        var chargeSS = that.data.chargeS;
                                        that.setData({
                                          height: res.windowHeight,
                                          userleft: res.windowWidth - 75,
                                          usertop: res.windowHeight - 85,
                                          // 定义控件数组，可以在data对象初始化为[],也可以不初始化，取决于是否需要更好的阅读
                                          controls: [
                                            {
                                              id: 2,
                                              iconPath: chargeSS,
                                              position: {
                                                left: res.windowWidth / 2 - 70,
                                                top: res.windowHeight - 150,
                                                width: 135,
                                                height: 135
                                              },
                                              clickable: true
                                            }, {
                                              id: 4,
                                              iconPath: '../../images/taocan.png',
                                              position: {
                                                left: 25,
                                                top: res.windowHeight - 95,
                                                width: 40,
                                                height: 40
                                              },
                                              clickable: true
                                            },
                                            {
                                              id: 1, // 给控件定义唯一id
                                              iconPath: '../../images/position.png', // 控件图标
                                              position: { // 控件位置
                                                left: 30, // 单位px
                                                top: res.windowHeight - 90, // 根据设备高度设置top值，可以做到在不同设备上效果一致
                                                width: 30, // 控件宽度/px
                                                height: 30 // 控件高度/px
                                              },
                                              clickable: true // 是否可点击，默认为true,可点击
                                            },

                                            {
                                              id: 3,
                                              iconPath: '../../images/bookBg.png',
                                              position: {
                                                left: res.windowWidth - 90,
                                                top: res.windowHeight - 95,
                                                width: 90,
                                                height: 52
                                              },
                                              clickable: false
                                            },

                                            {
                                              id: 5,
                                              iconPath: '../../images/book.png',
                                              position: {
                                                left: res.windowWidth - 30,
                                                top: res.windowHeight - 80,
                                                width: 20,
                                                height: 20
                                              },
                                              clickable: true
                                            },
                                            {
                                              id: 7,
                                              iconPath: '../../images/list.png',
                                              position: {
                                                left: res.windowWidth - 50,
                                                top: 10,
                                                width: 45,
                                                height: 45
                                              },
                                              clickable: true
                                            }]
                                        })

                                      }
                                    })
                                  } else {
                                    app.globalData.homeRefresh = true;
                                    that.setData({
                                      chargeS: '../../images/charging.png',
                                    })
                                    chargeS = '../../images/charging.png';
                                    wx.getSystemInfo({
                                      success: function (res) {
                                        wx.hideLoading()
                                        var listLocation = 500
                                        if (res.windowHeight > 639) {
                                          listLocation = 660;
                                        } else if (res.windowHeight >= 603 && res.windowHeight <= 639) {
                                          listLocation = 590;
                                        } else if (res.windowHeight < 603) {
                                          listLocation = 560;
                                        } else {
                                          listLocation = 500
                                        }
                                        var chargeSS = that.data.chargeS;
                                        that.setData({
                                          height: res.windowHeight,
                                          userleft: res.windowWidth - 75,
                                          usertop: res.windowHeight - 85,
                                          // 定义控件数组，可以在data对象初始化为[],也可以不初始化，取决于是否需要更好的阅读
                                          controls: [
                                            {
                                              id: 2,
                                              iconPath: chargeSS,
                                              position: {
                                                left: res.windowWidth / 2 - 70,
                                                top: res.windowHeight - 150,
                                                width: 135,
                                                height: 135
                                              },
                                              clickable: true
                                            }, {
                                              id: 4,
                                              iconPath: '../../images/taocan.png',
                                              position: {
                                                left: 25,
                                                top: res.windowHeight - 95,
                                                width: 40,
                                                height: 40
                                              },
                                              clickable: true
                                            },
                                            {
                                              id: 1, // 给控件定义唯一id
                                              iconPath: '../../images/position.png', // 控件图标
                                              position: { // 控件位置
                                                left: 30, // 单位px
                                                top: res.windowHeight - 90, // 根据设备高度设置top值，可以做到在不同设备上效果一致
                                                width: 30, // 控件宽度/px
                                                height: 30 // 控件高度/px
                                              },
                                              clickable: true // 是否可点击，默认为true,可点击
                                            },
                                            {
                                              id: 3,
                                              iconPath: '../../images/bookBg.png',
                                              position: {
                                                left: res.windowWidth - 90,
                                                top: res.windowHeight - 95,
                                                width: 90,
                                                height: 52

                                              },
                                              clickable: false
                                            },

                                            {
                                              id: 5,
                                              iconPath: '../../images/book.png',
                                              position: {
                                                left: res.windowWidth - 30,
                                                top: res.windowHeight - 80,
                                                width: 20,
                                                height: 20
                                              },
                                              clickable: true
                                            },
                                            {
                                              id: 7,
                                              iconPath: '../../images/list.png',
                                              position: {
                                                left: res.windowWidth - 50,
                                                top: 10,
                                                width: 45,
                                                height: 45
                                              },
                                              clickable: true
                                            }]
                                        })
                                      }
                                    })
                                  }
                                }
                              })
                            }
                          })
                        }
                      })
                    },
                    fail: function () {
                    }

                  })
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }
                },
                fail: function (res) {
                }
              })
            } 
            else {
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  console.log(res,"haha");
                  var getUserInfo = res;
                  var userInfo = res.userInfo;
                  that.setData({
                    user: res.userInfo.avatarUrl
                  })
                  wx.request({//登录获得token
                    url: app.globalData.Route + "/api/smallroutinelogin/getOpenId?code=" + code
                    + "&userName=" + userInfo.nickName + "&avatarUrl=" + userInfo.avatarUrl + "&area=" +
                    userInfo.area + "&address=" + userInfo.address + "&province=" + userInfo.province,
                    method: "POST",
                    header: {
                      'Content-Type': 'application/ json;charset=UTF - 8;'
                    },
                    success: function (res) {
                      console.log(res.data.accessToken)
                      app.globalData.token = res.data.accessToken;
                      app.globalData.userId = res.data.userId;
                      //将登录信息缓存到本地
                      wx.setStorage({
                        key: "login",
                        data: res
                      })
                      wx.getLocation({//获得所在位置
                        success: function (res) {
                          that.data.longitude = res.longitude;
                          that.data.latitude = res.latitude;
                          that.setData({
                            longitude: res.longitude,
                            latitude: res.latitude
                          })
                          wx.setStorage({
                            key: 'location',
                            data: res,
                            success: function (res) {
                              wx.request({//套餐接口
                                url: app.globalData.Route + "/api/chargeorder/findRechargemodels",
                                header: {
                                  'Content-Type': 'application/ json;charset=UTF - 8;'
                                },
                                method: "POST",
                                success: function (res) {
                                  that.setData({
                                    timeArray: res.data.object.content
                                  })
                                  wx.getStorage({
                                    key: 'login',
                                    success: function (res) {
                                      var userId = res.data.data.userId;
                                      var token = res.data.data.accessToken;
                                      wx.setStorageSync('token', token)
                                      wx.setStorageSync('userId', userId)
                                      wx.request({//请求附近电桩
                                        url: app.globalData.Route + "/api/wireless/findWirelessList?lng=" + that.data.longitude + "&lat=" + that.data.latitude + "&accessToken=" + token + "&wireType=1" + "&pageSize=300",
                                        method: "POST",
                                        header: {
                                          'Content-Type': 'application/ json;charset=UTF - 8;'
                                        },
                                        success: function (res) {
                                          wx.hideLoading()
                                          for (let i = 0; i < res.data.object.content.length; i++) {
                                            markers.push(res.data.object.content[i])
                                          }
                                          markers.map(function (value) {
                                            var position = MapabcEncryptToBdmap(value.lat, value.lng);
                                            value.iconPath = "/images/positionL.png";
                                            value.title = value.address;
                                            value.title = "";
                                            value.width = 30;
                                            value.height = 36;
                                            var latitude = parseFloat(position.lat);
                                            value.latitude = latitude;
                                            var longitude = parseFloat(position.lng);
                                            value.longitude = longitude;
                                          })
                                          wx.setStorage({
                                            key: 'markers',
                                            data: markers,
                                          })
                                          that.setData({
                                            markers: markers,
                                            userhead: true
                                          })
                                        },
                                        fail: function (res) {
                                          wx.hideLoading()
                                          wx.showToast({
                                            title: '请检查网络链接',
                                          })
                                        }
                                      })
                                    },
                                  })
                                },
                                fail: function (res) { },
                              })
                            },
                          })
                        },
                        fail: function () {
                          wx.showModal({
                            title: '温馨提示',
                            content: '由于部分安卓手机不开启定位无法进行蓝牙连接，请您打开定位',
                            showCancel: false,
                            confirmText: '知道了',
                            success: function (res) {
                              if (res.confirm) {
                                console.log('用户点击确定')
                              }
                            }
                          })
                        },
                        complete: function () {
                          wx.getStorage({
                            key: 'login',
                            success: function (res) {
                              that.setData({
                                token: res.data.data.accessToken
                              })
                              var token = res.data.data.accessToken;
                              wx.setStorageSync("token", token);
                              wx.setStorageSync("userId", res.data.data.userId);
                              wx.request({//判断是否充电
                                url: app.globalData.Route + "/api/chargeorder/findChargeOrder?userId=" + res.data.data.userId + "&accessToken=" + token,
                                method: "POST",
                                header: {
                                  'Content-Type': 'application/ json;charset=UTF - 8;'
                                },
                                success: function (res) {
                                  console.log(res,'判断是否充电')
                                  wx.setStorageSync('charge1', res.data.code);
                                  if (res.data.code == 0) {
                                    //如果code为0那么显示扫码充电
                                    app.globalData.homeRefresh = false;
                                    that.setData({
                                      chargeS: '../../images/charge.png',
                                    })
                                    chargeS = '../../images/charge.png';
                                    wx.getSystemInfo({
                                      success: function (res) {
                                        wx.hideLoading()
                                        var listLocation = 500
                                        if (res.windowHeight > 639) {
                                          listLocation = 660;
                                        } else if (res.windowHeight >= 603 && res.windowHeight <= 639) {
                                          listLocation = 590;
                                        } else if (res.windowHeight < 603) {
                                          listLocation = 560;
                                        } else {
                                          listLocation = 500
                                        }
                                        var chargeSS = that.data.chargeS;
                                        that.setData({
                                          height: res.windowHeight,
                                          userleft: res.windowWidth - 75,
                                          usertop: res.windowHeight - 85,
                                          // 定义控件数组，可以在data对象初始化为[],也可以不初始化，取决于是否需要更好的阅读
                                          controls: [
                                            {
                                              id: 2,
                                              iconPath: chargeSS,
                                              position: {
                                                left: res.windowWidth / 2 - 70,
                                                top: res.windowHeight - 150,
                                                width: 135,
                                                height: 135
                                              },
                                              clickable: true
                                            }, {
                                              id: 4,
                                              iconPath: '../../images/taocan.png',
                                              position: {
                                                left: 25,
                                                top: res.windowHeight - 95,
                                                width: 40,
                                                height: 40
                                              },
                                              clickable: true
                                            },
                                            {
                                              id: 1, // 给控件定义唯一id
                                              iconPath: '../../images/position.png', // 控件图标
                                              position: { // 控件位置
                                                left: 30, // 单位px
                                                top: res.windowHeight - 90, // 根据设备高度设置top值，可以做到在不同设备上效果一致
                                                width: 30, // 控件宽度/px
                                                height: 30 // 控件高度/px
                                              },
                                              clickable: true // 是否可点击，默认为true,可点击
                                            },

                                            {
                                              id: 3,
                                              iconPath: '../../images/bookBg.png',
                                              position: {
                                                left: res.windowWidth - 90,
                                                top: res.windowHeight - 95,
                                                width: 90,
                                                height: 52

                                              },
                                              clickable: false
                                            },

                                            {
                                              id: 5,
                                              iconPath: '../../images/book.png',
                                              position: {


                                                left: res.windowWidth - 30,
                                                top: res.windowHeight - 80,
                                                width: 20,
                                                height: 20
                                              },
                                              clickable: true
                                            },
                                            {
                                              id: 7,
                                              iconPath: '../../images/list.png',
                                              position: {
                                                left: res.windowWidth - 50,
                                                top: 10,
                                                width: 45,
                                                height: 45
                                              },
                                              clickable: true
                                            }]
                                        })

                                      }
                                    })
                                  } else {
                                    app.globalData.homeRefresh = true;
                                    that.setData({
                                      chargeS: '../../images/charging.png',
                                    })
                                    chargeS = '../../images/charging.png';
                                    wx.getSystemInfo({
                                      success: function (res) {
                                        wx.hideLoading()
                                        var listLocation = 500
                                        if (res.windowHeight > 639) {
                                          listLocation = 660;
                                        } else if (res.windowHeight >= 603 && res.windowHeight <= 639) {
                                          listLocation = 590;
                                        } else if (res.windowHeight < 603) {
                                          listLocation = 560;
                                        } else {
                                          listLocation = 500
                                        }
                                        var chargeSS = that.data.chargeS;
                                        that.setData({
                                          height: res.windowHeight,
                                          userleft: res.windowWidth - 75,
                                          usertop: res.windowHeight - 85,
                                          // 定义控件数组，可以在data对象初始化为[],也可以不初始化，取决于是否需要更好的阅读
                                          controls: [
                                            {
                                              id: 2,
                                              iconPath: chargeSS,
                                              position: {
                                                left: res.windowWidth / 2 - 70,
                                                top: res.windowHeight - 150,
                                                width: 135,
                                                height: 135
                                              },
                                              clickable: true
                                            }, {
                                              id: 4,
                                              iconPath: '../../images/taocan.png',
                                              position: {
                                                left: 25,
                                                top: res.windowHeight - 95,
                                                width: 40,
                                                height: 40
                                              },
                                              clickable: true
                                            },
                                            {
                                              id: 1, // 给控件定义唯一id
                                              iconPath: '../../images/position.png', // 控件图标
                                              position: { // 控件位置
                                                left: 30, // 单位px
                                                top: res.windowHeight - 90, // 根据设备高度设置top值，可以做到在不同设备上效果一致
                                                width: 30, // 控件宽度/px
                                                height: 30 // 控件高度/px
                                              },
                                              clickable: true // 是否可点击，默认为true,可点击
                                            },
                                            {
                                              id: 3,
                                              iconPath: '../../images/bookBg.png',
                                              position: {
                                                left: res.windowWidth - 90,
                                                top: res.windowHeight - 95,
                                                width: 90,
                                                height: 52

                                              },
                                              clickable: false
                                            },

                                            {
                                              id: 5,
                                              iconPath: '../../images/book.png',
                                              position: {
                                                left: res.windowWidth - 30,
                                                top: res.windowHeight - 80,
                                                width: 20,
                                                height: 20
                                              },
                                              clickable: true
                                            },
                                            {
                                              id: 7,
                                              iconPath: '../../images/list.png',
                                              position: {
                                                left: res.windowWidth - 50,
                                                top: 10,
                                                width: 45,
                                                height: 45
                                              },
                                              clickable: true
                                            }]
                                        })

                                      }
                                    })

                                  }
                                }
                              })
                            }
                          })
                        }
                      })
                    },
                    fail: function (res) {
                    }

                  })
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }
                },
                fail: function (res) {
                }
              })

            }
          }
        })
      }
    })
    that.setData({
      chargeS: '../../images/charge.png',

    })
    chargeS = '../../images/charge.png';
    // wx.getUserInfo({//获取用户信息
    //   success: function (res) {
    //     userInfo = res.userInfo
    //   }
    // })
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
    // wx.getSetting({
    //   success(res) {
    //     if (!res.authSetting['scope.userInfo']) {
    //       wx.authorize({
    //         scope: 'scope.userInfo',
    //         success(res) {
    //         }
    //       })
    //     }
    //   }
    // })
  },
  //通过电桩跳到驿站详情
  bindcallouttap: function (e) {
    var id = e.markerId;
    wx.navigateTo({
      url: '../list/storeDetails?id=' + id,
    })
  },
  // 地图控件点击事件
  controltap: function (e) {
    var that = this;
    // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第3步设置的id
    switch (e.controlId) {
      // 点击定位控件
      case 1: this.movetoPosition();
        that.setData({
          chargeInfomation: false
        })
        break;
      // 点击立即用车，判断当前是否正在计费，此处只需要知道是调用扫码，后面会讲到this.timer是怎么来的
      case 2: if (this.timer === "" || this.timer === undefined) {
        var code = wx.getStorageSync('charge1');
        that.setData({
          chargeInfomation: false
        })
        // 没有在计费就扫码
        if (code == 0) {//判断是否在充电\
          if (app.globalData.scanNot) {
            var token = wx.getStorageSync("token");
            var userId = wx.getStorageSync("userId");
            wx.request({//判断是否充电
              url: app.globalData.Route + "/api/chargeorder/findChargeOrder?userId=" + userId + "&accessToken=" + token,
              method: "POST",
              header: {
                'Content-Type': 'application/ json;charset=UTF - 8;'
              },
              success: function (res) {
                var code = res.data.code;
                wx.getStorage({//自动断开蓝牙
                  key: 'deviceId',
                  success: function (res) {
                    var deviceId = res.data;
                    wx.closeBLEConnection({
                      deviceId: deviceId,
                      success: function (res) {
                      },
                    })
                  },
                });
                if (code == 0) {
                  app.globalData.scanNot = false;//修改需要打开充电的参数
                  app.globalData.deviceIdSesseion = false;//清除deviceID缓存的参数
                }
              },
              fail: function () {
              }
            })
          }
          if (!app.globalData.scanNot) {
            wx.scanCode({
              success: (res) => {
                app.globalData.chargeingTime = true
                var NetworkStatus;
                wx.onNetworkStatusChange(function (res) {//监听网络状态
                  NetworkStatus = res.networkType;//判断网络是否连接 true false
                })
                var code = res
                var url = code.result; //获取url中参数  
                var one = url.split("?");
                if (one[0] == "http://www.ewwj.net") {
                  // if (NetworkStatus){
                  wx.openBluetoothAdapter({
                    success: function (res) {
                      var url = code.result; //获取url中参数  
                      // var theRequest = new Object();
                      url = url.split("?");
                      url = url[1].split("=");
                      var id = url[1];
                      app.globalData.Id = id;

                      // wx.navigateTo({
                      //   url: '../charge/charge?id=' + id,
                      // });    

                      wx.request({//获取wireless状态
                        url: app.globalData.Route + "/api/wireless/findWirelessType",
                        data: {
                          userId: app.globalData.userId,
                          wirelessCode: id,
                        },
                        method: "POST",
                        header: {
                          'Content-Type': 'application/x-www-form-urlencoded;'
                        },
                        success: function (res) {
                          if (res.data.code !== 1) {
                            wx.showModal({
                              title: '温馨提示',
                              content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
                              showCancel: false,
                              success: function (res) {
                                if (res.confirm) {
                                  wx.reLaunch({
                                    url: '../map/map',
                                  })
                                } else if (res.cancel) {
                                  wx.reLaunch({
                                    url: '../map/map',
                                  })
                                }
                              }
                            })
                          } else {
                            wx.navigateTo({
                              url: '../charge/charge?id=' + id,
                            });
                          }
                        },
                        fail: function (res) {
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
                    fail: function () {
                      wx.showModal({
                        title: '蓝牙连接失败',
                        content: '请开启蓝牙',
                        showCancel: false,
                        success: function (res) {
                          if (res.confirm) {
                            wx.reLaunch({
                              url: '../map/map',
                            })
                          } else if (!res.cancel) {
                            wx.reLaunch({
                              url: '../map/map',
                            })
                          }
                        }
                      })
                    }
                  })
                } else {
                  app.globalData.homeRefresh = false;//设置是否刷新
                  wx.showModal({
                    title: '错误',
                    content: '您的二维码扫描错误！',
                    showCancel: false,
                    success: function (res) {
                      if (res.confirm) {
                        wx.reLaunch({
                          url: '../map/map',
                        })
                      } else if (res.cancel) {
                        wx.reLaunch({
                          url: '../map/map',
                        })
                      }
                    }
                  })
                }
              }
            })
          }

        } else {
          wx.showLoading({
            mask: true
          })
          wx.getStorage({
            key: 'orderNo',
            success: function (res) {
              var orderNo = res.data.orderNo;
              var allTime = res.data.time
              wx.request({//更新充电时间
                url: app.globalData.Route + "/api/chargeorder/updateChargeOrder ",
                data: {
                  orderNo: orderNo,
                  accessToken: that.data.token,
                },
                method: "POST",
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded;'
                },
                success: function (res) {
                  wx.hideLoading()
                  if (res.data.message == "订单已关闭") {
                    //关闭蓝牙设备和断开蓝牙
                    wx.openBluetoothAdapter({
                      success: function (res) {
                        wx.getStorage({
                          key: deviceId,
                          success: function (res) {
                            var deviceId = res.data;
                            let buffer = new ArrayBuffer(1)
                            let dataView = new DataView(buffer)
                            dataView.setUint8(0, 0x00)
                            wx.writeBLECharacteristicValue({//写入数据
                              deviceId: deviceId,
                              serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
                              characteristicId: "0000FFF1-0000-1000-8000-00805F9B34FB",
                              value: buffer,
                              success: function (res) {
                                wx.closeBLEConnection({
                                  deviceId: deviceId,
                                  success: function (res) {
                                  }
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
                              },
                              complete: function () {
                                wx.closeBLEConnection({
                                  deviceId: deviceId,
                                  success: function (res) {
                                  }
                                })
                                wx.reLaunch({
                                  url: '../map/map',
                                })
                              }

                            });
                          },
                          fail: function () {
                            wx.reLaunch({
                              url: '../map/map',
                            })
                          },
                          complete: function () {
                            wx.closeBLEConnection({
                              deviceId: deviceId,
                              success: function (res) {
                              }
                            })
                            wx.reLaunch({
                              url: '../map/map',
                            })
                          }
                        })
                      },
                      fail: function () {
                      },
                      complete: function () {
                        wx.reLaunch({
                          url: '../map/map',
                        })
                      }
                    })


                  } else {
                    var start = res.data.object.createTime
                    console.log(start,'start')
                    var now = res.data.object.lastModifiedTime
                    console.log(now, 'now')
                    var time = now - start;
                    console.log(time, 'time')
                    console.log(allTime, 'allTime')
                    // allTime = res.data.object.duration * 60 * 1000
                    time = allTime - time;
                    time = time;
                    console.log(time, 'time')
                    wx.navigateTo({
                      url: '../charge/charging?time=' + time
                    })
                    wx.hideLoading()
                  }
                },
                fail: function (res) {
                  wx.hideLoading()
                }
              })
            },
            fail: function (res) {
              wx.hideLoading()
              wx.navigateTo({
                url: '../charge/charging'
              })
            }
          })


        }
        // 当前已经在计费就回退到计费页
      } else {
        wx.navigateBack({
          delta: 1
        })
      }
        break;
      // 点击保障控件，跳转到报障页
      case 3:
        wx.navigateTo({
          url: '../pay/chooseList'
        });
        break;
      case 5:
        //打开弹窗页面
        that.setData({
          chargeInfomation: false,
          showDialog: false,
        });
        break;
      // 点击头像控件，跳转到列表
      case 7:
        wx.showLoading({
          title: '加载中',
          mask: true,
        })
        wx.navigateTo({
          url: '../list/list'
        });
        break;
      default: break;
    }
  },
  //用户点击充电桩地址
  chargego: function () {
    var that = this;
    that.setData({
      chargeInfomation: false
    })
    var latitude = wx.getStorageSync('chargelat');
    var longitude = wx.getStorageSync('chargelng');
    var address = wx.getStorageSync('chargeAdress1');
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 28,
      address: address,
    })


  },
  clickInformation: function (e) {
    var chargeId = e.markerId;
    chargeId = wx.getStorageSync("markerId");
    wx.navigateTo({
      url: '../list/postDetails?id=' + chargeId,
    })
    that.setData({
      chargeInfomation: false
    })
  },
  //用户点击屏幕使充电详情消失
  clickScreen: function (event) {
    var that = this;
    var markers = that.data.markers;
    markers.map(function (value) {
      value.iconPath = "/images/positionL.png";
    });
    setTimeout(function () {
      that.setData({
        markers: markers
      })
    }, 500)

    that.setData({
      chargeInfomation: false
    })

  },
  //用户点击充电桩
  bindmarkertap: function (e) {
    var that = this;
    var chargeId = e.markerId;
    var markers = that.data.markers;
    markers.map(function (value) {
      if (value.id == chargeId) {
        value.iconPath = "/images/location.png";
      } else {
        value.iconPath = "/images/positionL.png";
      }
    });
    wx.setStorageSync('markerId', chargeId);
    var token = wx.getStorageSync('token');
    var userId = wx.getStorageSync('userId');
    wx.request({//查询无线充详情
      url: app.globalData.Route + "/api/wireless/findWirelessDetail",
      data: {
        id: chargeId,
        userId: userId,
        accessToken: token
      },
      method: "POST",
      header: {
        'Content-Type': 'application/x-www-form-urlencoded;'
      },
      success: function (res) {
        var chargelat = res.data.object.lat;
        var chargelng = res.data.object.lng;
        var chargeAdress1 = res.data.object.address;
        wx.setStorageSync('chargelat', chargelat);
        wx.setStorageSync('chargelng', chargelng);
        wx.setStorageSync('chargeAdress1', chargeAdress1);
        var chargeImg = res.data.object.imgurl;
        wx.setStorageSync('chargeImg', chargeImg);
        chargeImg = app.globalData.Route + chargeImg;
        var markers = that.data.markers;
        that.setData({
          chargeImg: chargeImg,
          chargeInfomation: true,
          chargeAdress: res.data.object.address,
          chargeName: res.data.object.wireName,
        })

        setTimeout(function () {
          that.setData({
            markers: markers
          })
        }, 500)

      },
      fail: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '请检查网络链接',
        })
      }
    })


  },
  // 页面显示
  onShow: function () {
    if (app.globalData.homeRefresh) {
      this.onLoad();
    }
    //再加载
    // 1.创建地图上下文，移动当前位置到地图中心
    this.mapCtx = wx.createMapContext("Map"); // 地图组件的id
    this.movetoPosition();
  },
  // 定位函数，移动位置到地图中心
  movetoPosition: function () {
    this.mapCtx.moveToLocation();
  },

  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
    var that = this;

  },

})
