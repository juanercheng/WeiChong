// pages/charge/charge.js
var app = getApp()
var countTooGetLocation = 0;
var total_micro_second = 0;
var starRun = 0;
var interval;
var varName;
var ctx = wx.createCanvasContext('canvasArcCir');
//读出设备的ID 转微十进制
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    charge_state: true,
    collapse: true,
    chargetime: 0,
    stopcharge: false,
    charge_one: "微充",
    state1: true,
    state2: false,
    connectting: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var platform;
    var deviceId;
    app.globalData.overtime = true;
    app.globalData.tap = false;
    var Id = options.id;
    console.log(Id)

    try {
      var res = wx.getSystemInfoSync()//获取手机及微信信息
      platform = res.platform;
    } catch (e) {
      // Do something when catch error
    }

    if (wx.openBluetoothAdapter) {
      var overtime = setTimeout(function () {//如果连接超时则出现弹窗
          app.globalData.overtime = false;//设置超时true 或false
          wx.showModal({
            title: '蓝牙连接失败',
            content: '您的蓝牙连接超时，请重新启动蓝牙再试！',
            showCancel: false,
            success: function (res) {
              clearTimeout(overtime)

              if (res.confirm) {
                wx.reLaunch({
                  url: '../map/map',
                })
              } else if (!res.cancel) {
                wx.reLaunch({
                  url: '../map/map',
                })
              }
            },
          })
      }, 30000);

      //蓝牙连接
      var serviceId = [];
      var characteristicsuuid = [];
      wx.openBluetoothAdapter({//检查蓝牙是否开启
        success: function (res) {
          wx.getBluetoothAdapterState({
            success: function (res) {
              console.log("检查蓝牙是否开启", res)
              wx.onNetworkStatusChange(function (res) {
                var NetworkStatus = res.isConnected;
                if (!NetworkStatus) {
                  clearTimeout(overtime)
                  wx.showLoading({
                    title: '网络已断开',
                    mask: true,

                  })
                  // setTimeout(function () {
                  //   wx.hideLoading();
                  //   wx.reLaunch({
                  //     url: '../map/map',
                  //   })
                  // }, 1500)
                }
              })
              if (!res.discovering && res.available) {
                wx.startBluetoothDevicesDiscovery({//开始搜索蓝牙
                  services: ['FFF0'],
                  success: function (res) {
                    console.log("开始搜索蓝牙", res);
                    setTimeout(function () {
                      wx.getBluetoothDevices({//获取搜索到的蓝牙设备
                        success: function (res) {
                          console.log("获取搜索到的蓝牙设备", res)
                          app.globalData.bluetootha = false;
                          for (var i = 0; i < res.devices.length; i++) {
                            console.log("id", Id)
                            console.log((ab2hex(res.devices[i].advertisData)).toUpperCase(),'id')
                            if (((ab2hex(res.devices[i].advertisData)).toUpperCase()) == Id) {
                              app.globalData.bluetootha = true
                              var deviceId = res.devices[i].deviceId;

                              console.log("deviceId", deviceId)
                              wx.setStorage({
                                key: 'deviceId',
                                data: deviceId,
                              })
                              wx.createBLEConnection({//连接蓝牙
                                // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
                                deviceId: deviceId,
                                success: function (res) {
                                  console.log("连接蓝牙", res)
                                  wx.stopBluetoothDevicesDiscovery({
                                    success: function (res) {
                                    }
                                  })
                                  wx.getBLEDeviceServices({
                                    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
                                    deviceId: deviceId,
                                    success: function (res) {
                                      console.log(res)
                                      var serviceID = []
                                      res.services.map(function(value){
                                        if (value.uuid == "0000FFF0-0000-1000-8000-00805F9B34FB"){
                                          serviceID.push(value.uuid)
                                        }
                                      })
                                      var serviceId = serviceID[0];
                                      wx.setStorage({
                                        key: 'serviceId',
                                        data: serviceId,
                                      })
                                      wx.getBLEDeviceCharacteristics({
                                        // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                                        deviceId: deviceId,
                                        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                                        serviceId: serviceId,
                                        success: function (res) {
                                          console.log(res, 'getBLE')
                                          var characteristicuuid = res.characteristics[1].uuid;
                                          var characteristicuuidwheather = res.characteristics[0].uuid;
                                          wx.setStorage({
                                            key: 'characteristicuuid',
                                            data: res.characteristics[0].uuid,
                                          })
                                          wx.readBLECharacteristicValue({
                                            deviceId: deviceId,
                                            serviceId: serviceId,
                                            characteristicId: characteristicuuidwheather,
                                            success: function (res) {
                                              console.log(res);
                                            },
                                            fail: function () {
                                            },
                                            complete: function () {
                                              wx.onBLECharacteristicValueChange(function (characteristic) {//读取蓝牙随机4个字节
                                                wx.onBLEConnectionStateChange(function (res) {
                                                });
                                                let buffer = characteristic.value;
                                                console.log(buffer)
                                                var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
                                                console.log(arr)
                                                for (var i = 0; i < arr.length; i++) {
                                                  str += String.fromCharCode(arr[i])
                                                }
                                                console.log(str)
                                                var str = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
                                                console.log(str);
                                                if (str == "00") {//判断折是否再使用
                                                  wx.readBLECharacteristicValue({
                                                    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
                                                    deviceId: deviceId,
                                                    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                                                    serviceId: serviceId,
                                                    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                                                    characteristicId: characteristicuuid,
                                                    success: function (res) {
                                                    },
                                                    fail: function () {
                                                      clearTimeout(overtime)

                                                        ;
                                                      wx.showModal({
                                                        title: '蓝牙连接失败',
                                                        content: '请重新开启蓝牙',
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
                                                        },

                                                      })
                                                    },
                                                    complete: function () {
                                                      wx.onBLECharacteristicValueChange(function (characteristic) {
                                                        // wx.onBLEConnectionStateChange(function (res) {
                                                        // });
                                                        let buffer = characteristic.value;
                                                        var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
                                                        for (var i = 0; i < arr.length; i++) {
                                                          str += String.fromCharCode(arr[i])
                                                        }
                                                        var str = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join(''); 
                                                        console.log(str,'二')
                                                        if (str == "") {
                                                          clearTimeout(overtime)
                                                          wx.showModal({
                                                            title: '蓝牙连接失败',
                                                            content: '请重新开启蓝牙',
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
                                                            },

                                                          })
                                                        }
                                                        //握手算法请求接口
                                                        wx.request({
                                                          url: app.globalData.Route + "/api/sha1Controller/shake?code=" + Id + "&str=" + str,
                                                          method: "POST",
                                                          header: {
                                                            'Content-Type': 'application/ json;charset=UTF - 8;'
                                                          },
                                                          success: function (res) {
                                                            console.log(res,'握手成功')
                                                            wx.onNetworkStatusChange(function (res) {
                                                              if (res.isConnected == "none") {
                                                                clearTimeout(overtime)
                                                              }
                                                            })
                                                            wx.onBLEConnectionStateChange(function (res) {
                                                            })
                                                            //处理返回结果
                                                            var secret = res.data.key;
                                                            var secret = secret.toUpperCase();
                                                            var hex = secret;
                                                            var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
                                                              return parseInt(h, 16)
                                                            }));

                                                            var buffer = typedArray.buffer;
                                                            var dataview = new DataView(buffer);
                                                            var ints = new Uint8Array(buffer.byteLength);
                                                            for (var i = 0; i < ints.length; i++) {
                                                              ints[i] = dataview.getUint8(i);
                                                            }
                                                            var characteristics;
                                                            wx.getStorage({
                                                              key: 'characteristics',
                                                              success: function (res) {
                                                                characteristics = res.data.data.characteristics;
                                                              },
                                                            })
                                                            wx.writeBLECharacteristicValue({//写入数据
                                                              // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
                                                              deviceId: deviceId,
                                                              // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                                                              serviceId: serviceId,
                                                              // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                                                              characteristicId: characteristicuuid,
                                                              value: buffer,
                                                              success: function (res) {
                                                                //判断连接过程中蓝牙是否断开
                                                                var connectState = wx.getStorageSync("connectState");
                                                                clearTimeout(overtime)
                                                                wx.redirectTo({
                                                                  url: '../pay/payList',//成功后跳到支付页面
                                                                })


                                                                wx.onBLECharacteristicValueChange(function (characteristic) {

                                                                })
                                                              },
                                                              fail: function (res) {
                                                                wx.reLaunch({
                                                                  url: '../map/map',//失败后跳到失败页面
                                                                })
                                                              },
                                                              complete: function () {
                                                                wx.readBLECharacteristicValue({
                                                                  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
                                                                  deviceId: deviceId,
                                                                  // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                                                                  serviceId: serviceId,
                                                                  // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                                                                  characteristicId: characteristicuuid,
                                                                  success: function (res) {
                                                                  }
                                                                })
                                                              }

                                                            })
                                                          },
                                                          fail: function (res) {
                                                            wx.onNetworkStatusChange(function (res) {
                                                              if (res.isConnected == "none") {
                                                                clearTimeout(overtime)
                                                              }
                                                            })

                                                          }
                                                        })
                                                      })
                                                    }
                                                  })

                                                  wx.onBLEConnectionStateChange(function (res) {
                                                    var connectState = res.connected;
                                                    wx.setStorageSync("connectState", connectState)
                                                  })
                                                } else if (str == "01") {
                                                  clearTimeout(overtime)
                                                  wx.showModal({
                                                    title: '温馨提示',
                                                    content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
                                                    showCancel: false,
                                                    success: function (res) {
                                                      wx.reLaunch({
                                                        url: '../map/map',
                                                      })
                                                    }
                                                  })
                                                }
                                              })

                                            }
                                          })
                                        },
                                        fail: function () {
                                          wx.showModal({
                                            title: '蓝牙连接失败',
                                            content: '请重新开启蓝牙',
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
                                            },

                                          })
                                        }
                                      })
                                    },
                                    fail: function () {
                                      clearTimeout(overtime)
                                      wx.showModal({
                                        title: '蓝牙连接失败',
                                        content: '请重新开启蓝牙',
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
                                        },

                                      })
                                    }

                                  })
                                },
                                fail: function () {
                                  clearTimeout(overtime)
                                  wx.showModal({
                                    title: '蓝牙连接失败',
                                    content: '请重新开启蓝牙',
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
                                    },

                                  })

                                },

                              })
                            } else if ((ab2hex(res.devices[i].advertisData)) != Id) {
                              console.log("没有与之匹配的id")
                              console.log("当没有找到相关蓝牙后提示设备已经开启")
                              // wx.showModal({
                              //   title: '温馨提示',
                              //   content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
                              //   showCancel: false,
                              //   success: function (res) {
                              //     wx.reLaunch({
                              //       url: '../map/map',
                              //     })
                              //   }
                              // })
                            }
                          }
                          if (!app.globalData.bluetootha) {
                            console.log("检测蓝牙是否有相同匹配项", app.globalData.bluetootha)
                            clearTimeout(overtime)
                            wx.showModal({
                              title: '温馨提示',
                              content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
                              showCancel: false,
                              success: function (res) {
                                wx.reLaunch({
                                  url: '../map/map',
                                })
                              }
                            })
                          }

                        },
                        fail: function () {
                          wx.showModal({
                            title: '蓝牙连接失败',
                            content: '请重新开启蓝牙',
                            showCancel: false,
                            success: function (res) {
                              clearTimeout(overtime)
                              if (res.confirm) {

                                wx.reLaunch({
                                  url: '../map/map',
                                })
                              } else if (res.cancel) {

                                wx.reLaunch({
                                  url: '../map/map',
                                })
                              }
                            },

                          })
                        }
                      })
                    }, 3000)
                  },
                  fail: function () {
                  }
                })

              } else {
                wx.showModal({
                  title: '蓝牙连接失败',
                  content: '请重新开启蓝牙',
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
                  },

                })

              }
            },
            fail: function () {
              wx.showModal({
                title: '蓝牙连接失败',
                content: '请检查蓝牙是否开启搜索',
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
                },

              })
            }
          })

        },
        fail: function (res) {//蓝牙失败后提示开启蓝牙
          wx.showModal({
            title: '蓝牙连接失败',
            content: '请检查蓝牙是否开启搜索',
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
            },

          })

        },
        complete: function (res) {
          wx.onBLEConnectionStateChange(function (res) {
          })
        }
      })

      // if (platform == "android") {//安卓
      //   wx.openBluetoothAdapter({//检查蓝牙是否开启
      //     success: function (res) {
      //       console.log(res,'检查蓝牙是否开启')
      //       wx.getBluetoothAdapterState({
      //         success: function (res) {
      //           console.log(res, 1)
      //           if (!res.discovering && res.available) {
      //             wx.startBluetoothDevicesDiscovery({
      //               services: ['FFF0'],
      //               success: function (res) {
      //                 console.log(res, '2')
      //                 setTimeout(function () {
      //                   wx.getBluetoothDevices({//获得同广播下的设备
      //                     success: function (res) {
      //                       console.log(res, '3')
      //                       wx.onNetworkStatusChange(function (res) {
      //                         var NetworkStatus = res.isConnected;
      //                         if (!NetworkStatus) {
      //                           clearTimeout(overtime);
      //                           wx.showLoading({
      //                             title: '网络已断开',
      //                             mask: true,
      //                           })
      //                           // setTimeout(function () {
      //                           //   wx.hideLoading();
      //                           //   wx.reLaunch({
      //                           //     url: '../map/map',
      //                           //   })
      //                           // }, 1500)
      //                         }
      //                       })
      //                       //如果搜素到蓝牙设备为空的时候则提示搜索失败
      //                       if (res.devices == "") {
      //                         clearTimeout(overtime)
      //                         wx.showModal({
      //                           title: '蓝牙连接失败',
      //                           content: '您的蓝牙连接超时，请重新启动蓝牙再试！',
      //                           showCancel: false,
      //                           success: function (res) {
      //                             clearTimeout(overtime)
      //                             if (res.confirm) {
      //                               wx.reLaunch({
      //                                 url: '../map/map',
      //                               })
      //                             } else if (!res.cancel) {
      //                               wx.reLaunch({
      //                                 url: '../map/map',
      //                               })
      //                             }
      //                           },
      //                         })
      //                       }
      //                       app.globalData.bluetootha = false
      //                       //根据搜索到的蓝牙和扫描设备编号来匹配
      //                       for (var i = 0; i < res.devices.length; i++) {
      //                         if (((ab2hex(res.devices[i].advertisData)).toUpperCase()) == Id) {
      //                           app.globalData.bluetootha = true
      //                           var deviceId = res.devices[i].deviceId;//获取android的Mac地址
      //                           console.log(deviceId)
      //                           wx.setStorage({//存去android的MAC地址
      //                             key: 'deviceIdFailure',
      //                             data: deviceId,
      //                           })
      //                           setTimeout(function () {
      //                             wx.setStorage({//存去android的MAC地址
      //                               key: 'deviceId',
      //                               data: deviceId,
      //                             })
      //                             wx.createBLEConnection({//连接蓝牙
      //                               deviceId: deviceId,
      //                               success: function (res) {
      //                                 console.log(res)
      //                                 wx.readBLECharacteristicValue({
      //                                   deviceId: deviceId,
      //                                   serviceId: "0000FFF0-0000-1000-8000-00805F9B34FB",
      //                                   characteristicId: "0000FFF1-0000-1000-8000-00805F9B34FB",
      //                                   success: function (res) {
      //                                     console.log(res,"蓝牙连接成功")
      //                                   },
      //                                   fail: function () {
      //                                     console.log(res, "蓝牙连接失败")
      //                                   },
      //                                   complete: function () {
      //                                     wx.onBLECharacteristicValueChange(function (characteristic) {//读取蓝牙随机4个字节
      //                                       wx.onBLEConnectionStateChange(function (res) {
      //                                       });
      //                                       console.log(characteristic)
      //                                       let buffer = characteristic.value;
      //                                       var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
      //                                       for (var i = 0; i < arr.length; i++) {
      //                                         str += String.fromCharCode(arr[i])
      //                                       }
      //                                       var str = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
      //                                       if (str == "00") {//判断设备是否再使用中
      //                                         wx.getBLEDeviceServices({//开始获得蓝牙设备服务
      //                                           deviceId: deviceId,
      //                                           success: function (res) {
                                               
      //                                             var serviceId = res.services[0].uuid;
      //                                             wx.setStorage({
      //                                               key: 'serviceId',
      //                                               data: serviceId,
      //                                             })
      //                                             wx.getBLEDeviceCharacteristics({
      //                                               // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      //                                               deviceId: deviceId,
      //                                               // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      //                                               serviceId: serviceId,
      //                                               success: function (res) {
      //                                                 console.log(res,'11111')
      //                                                 // var readWrite = [];
      //                                                 // res.characteristics.map(function(value){
      //                                                 //   if (value.properties.read && value.properties.write){
      //                                                 //     readWrite.push(value)
      //                                                 //   }
      //                                                 // })
      //                                                 // console.log(readWrite)
      //                                                 var characteristicuuid = res.characteristics[1].uuid;
      //                                                 // var characteristicuuid = readWrite[0].uuid;
      //                                                 wx.setStorage({
      //                                                   key: 'characteristics',
      //                                                   data: res.characteristics,
      //                                                 })
      //                                                 wx.readBLECharacteristicValue({
      //                                                   // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
      //                                                   deviceId: deviceId,
      //                                                   // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      //                                                   serviceId: serviceId,
      //                                                   // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      //                                                   characteristicId: characteristicuuid,
      //                                                   success: function (res) {
      //                                                     console.log(res,'read')
      //                                                   },
      //                                                   fail: function () {
      //                                                     wx.showModal({
      //                                                       title: '蓝牙连接失败',
      //                                                       content: '请重新开启蓝牙',
      //                                                       showCancel: false,
      //                                                       success: function (res) {
      //                                                         clearTimeout(overtime)
      //                                                         if (res.confirm) {
                                                              
      //                                                           wx.reLaunch({
      //                                                             url: '../map/map',
      //                                                           })
      //                                                         } else if (!res.cancel) {
                                                                  
      //                                                           wx.reLaunch({
      //                                                             url: '../map/map',
      //                                                           })
      //                                                         }
      //                                                       },

      //                                                     })
      //                                                   },
      //                                                   complete: function () {
      //                                                     wx.onBLECharacteristicValueChange(function (characteristic) {//读取蓝牙随机4个字节
      //                                                       wx.onBLEConnectionStateChange(function (res) {

      //                                                       });
      //                                                       let buffer = characteristic.value;
      //                                                       console.log(buffer,'buffer')
      //                                                       var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
      //                                                       console.log(arr,'arr')
      //                                                       for (var i = 0; i < arr.length; i++) {
      //                                                         str += String.fromCharCode(arr[i])
      //                                                       }
      //                                                       console.log(str, 'str')
      //                                                       var str = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
      //                                                       console.log(str,'str')
      //                                                       if (str == "") {
      //                                                         clearTimeout(overtime)
      //                                                         wx.showModal({
      //                                                           title: '蓝牙连接失败',
      //                                                           content: '请重新开启蓝牙',
      //                                                           showCancel: false,
      //                                                           success: function (res) {
      //                                                             if (res.confirm) {
                                                                  
      //                                                               wx.reLaunch({
      //                                                                 url: '../map/map',
      //                                                               })
      //                                                             } else if (!res.cancel) {
                                                                      
      //                                                               wx.reLaunch({
      //                                                                 url: '../map/map',
      //                                                               })
      //                                                             }
      //                                                           },
      //                                                         })
      //                                                       }
                                                         
      //                                                       wx.request({//请求握手算法接口
      //                                                         url: app.globalData.Route + "/api/sha1Controller/shake?code=" + Id + "&str=" + str,
      //                                                         method: "POST",
      //                                                         header: {
      //                                                           'Content-Type': 'application/ json;charset=UTF - 8;'
      //                                                         },
      //                                                         success: function (res) {
      //                                                           console.log(res,1)
      //                                                           console.log(Id,'Id')
      //                                                           wx.onNetworkStatusChange(function (res) {
      //                                                             if (res.isConnected == "none") {
      //                                                               clearTimeout(overtime)
      //                                                             }
      //                                                           })
                                                             
      //                                                           wx.onBLEConnectionStateChange(function (res) {
      //                                                             console.log(res,2)
      //                                                           })
      //                                                           //处理返回结果
      //                                                           var secret = res.data.key;
      //                                                           console.log(secret,'secret')
      //                                                           var secret = secret.toUpperCase();
      //                                                           var hex = secret;
      //                                                           var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      //                                                             return parseInt(h, 16)
      //                                                           }));

      //                                                           var buffer = typedArray.buffer;
      //                                                           var dataview = new DataView(buffer);
      //                                                           var ints = new Uint8Array(buffer.byteLength);
      //                                                           for (var i = 0; i < ints.length; i++) {
      //                                                             ints[i] = dataview.getUint8(i);
      //                                                           }
      //                                                           var characteristics;
      //                                                           wx.setStorage({
      //                                                             key: 'characteristics',
      //                                                             success: function (res) {
      //                                                               characteristics = res.characteristics;
      //                                                             },
      //                                                           })
      //                                                           wx.writeBLECharacteristicValue({//写入数据
      //                                                             // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
      //                                                             deviceId: deviceId,
      //                                                             // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      //                                                             serviceId: serviceId,
      //                                                             // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      //                                                             characteristicId: characteristicuuid,
      //                                                             value: buffer,
      //                                                             success: function (res) {
      //                                                               clearTimeout(overtime)
                                                                    
      //                                                               //判断连接过程中蓝牙是否断开
      //                                                               var connectState = wx.getStorageSync("connectState");
      //                                                               if (!connectState) {
      //                                                                 clearTimeout(overtime)
      //                                                                 wx.redirectTo({
      //                                                                   url: '../pay/payList',//成功后跳到支付页面
      //                                                                 })
      //                                                               } else {
      //                                                                 clearTimeout(overtime)
      //                                                                 wx.showModal({
      //                                                                   title: '蓝牙连接失败',
      //                                                                   content: '请重新开启蓝牙',
      //                                                                   showCancel: false,
      //                                                                   success: function (res) {
      //                                                                     if (res.confirm) {
                                                                          
      //                                                                       wx.reLaunch({
      //                                                                         url: '../map/map',
      //                                                                       })
      //                                                                     } else if (!res.cancel) {
                                                                              
      //                                                                       wx.reLaunch({
      //                                                                         url: '../map/map',
      //                                                                       })
      //                                                                     }
      //                                                                   },

      //                                                                 })
      //                                                               }
      //                                                               wx.onBLECharacteristicValueChange(function (characteristic) {

      //                                                               })
      //                                                             },
      //                                                             fail: function (res) {
      //                                                               wx.reLaunch({
      //                                                                 url: '../map/map',//失败后跳到失败页面
      //                                                               })
      //                                                             }

      //                                                           })
      //                                                         },
      //                                                         fail: function (res) {
      //                                                           wx.onNetworkStatusChange(function (res) {
      //                                                             if (res.isConnected == "none") {
      //                                                               clearTimeout(overtime)
      //                                                             }
      //                                                           })
                
      //                                                         }
      //                                                       })
      //                                                     })
      //                                                   }
      //                                                 })
      //                                               },
      //                                               fail: function () {
      //                                                 wx.showModal({
      //                                                   title: '蓝牙连接失败',
      //                                                   content: '请重新开启蓝牙',
      //                                                   showCancel: false,
      //                                                   success: function (res) {
      //                                                     clearTimeout(overtime)
      //                                                     if (res.confirm) {
                                                          
      //                                                       wx.reLaunch({
      //                                                         url: '../map/map',
      //                                                       })
      //                                                     } else if (!res.cancel) {
                                                              
      //                                                       wx.reLaunch({
      //                                                         url: '../map/map',
      //                                                       })
      //                                                     }
      //                                                   },
 
      //                                                 })
      //                                               }
      //                                             })

      //                                           },
      //                                           fail: function () {

      //                                             wx.showModal({
      //                                               title: '蓝牙连接失败',
      //                                               content: '请重新开启蓝牙',
      //                                               showCancel: false,
      //                                               success: function (res) {
      //                                                 clearTimeout(overtime)
      //                                                 if (res.confirm) {
                                                      
      //                                                   wx.reLaunch({
      //                                                     url: '../map/map',
      //                                                   })
      //                                                 } else if (!res.cancel) {
                                                          
      //                                                   wx.reLaunch({
      //                                                     url: '../map/map',
      //                                                   })
      //                                                 }
      //                                               },

      //                                             })
      //                                           }

      //                                         });
      //                                       } else if (str == "01") {
      //                                         wx.showModal({
      //                                           title: '温馨提示',
      //                                           content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
      //                                           showCancel: false,
      //                                           success: function (res) {
      //                                             clearTimeout(overtime)
      //                                             wx.reLaunch({
      //                                               url: '../map/map',
      //                                             })
      //                                           }
      //                                         })
      //                                       1}
      //                                     })
      //                                   }
      //                                 })
      //                                 //连接成功后停止搜索蓝牙
      //                                 wx.stopBluetoothDevicesDiscovery({
      //                                   success: function (res) {
      //                                   }
      //                                 })

      //                               },
      //                               fail: function () {
      //                                 clearTimeout(overtime)


      //                                 wx.showModal({
      //                                   title: '蓝牙连接失败',
      //                                   content: '您的蓝牙蓝牙连接失败',
      //                                   showCancel: false,
      //                                   success: function (res) {
      //                                     if (res.confirm) {
                                          
      //                                       wx.reLaunch({
      //                                         url: '../map/map',
      //                                       })
      //                                     } else if (!res.cancel) {
                                              
      //                                       wx.reLaunch({
      //                                         url: '../map/map',
      //                                       })
      //                                     }
      //                                   },

      //                                 })

      //                               },
      //                               complete: function () {
      //                                 wx.onBLEConnectionStateChange(function (res) {//监听蓝牙连接状态
      //                                   var connectState = res.connected;
      //                                 })
      //                               }
      //                             })
      //                           }, 2000)
      //                         } else {
      //                           console.log("没有与之匹配的id")
      //                           console.log("当没有找到相关蓝牙后提示设备已经开启")
      //                           // wx.showModal({
      //                           //   title: '温馨提示',
      //                           //   content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
      //                           //   showCancel: false,
      //                           //   success: function (res) {
      //                           //     wx.reLaunch({
      //                           //       url: '../map/map',
      //                           //     })
      //                           //   }
      //                           // })
      //                         }
      //                       }
      //                       if (!app.globalData.bluetootha) {
      //                         console.log("检测蓝牙是否有相同匹配项", app.globalData.bluetootha)
      //                         clearTimeout(overtime)
      //                         wx.showModal({
      //                           title: '温馨提示',
      //                           content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
      //                           showCancel: false,
      //                           success: function (res) {
      //                             wx.reLaunch({
      //                               url: '../map/map',
      //                             })
      //                           }
      //                         })
      //                       }
      //                     },
      //                     fail: function () {
      //                       wx.showModal({
      //                         title: '蓝牙连接失败',
      //                         content: '请重新开启蓝牙',
      //                         showCancel: false,
      //                         success: function (res) {
      //                           clearTimeout(overtime)
      //                           if (res.confirm) {
                                
      //                             wx.reLaunch({
      //                               url: '../map/map',
      //                             })
      //                           } else if (!res.cancel) {
                                    
      //                             wx.reLaunch({
      //                               url: '../map/map',
      //                             })
      //                           }
      //                         },

      //                       })
      //                     }
      //                   })
      //                 }, 3000)
      //               },
      //               fail: function () {//开始搜索蓝牙失败执行的方法
      //               }
      //             })
      //           } else {
      //             clearTimeout(overtime)

      //             wx.showModal({
      //               title: '蓝牙连接失败',
      //               content: '请检查蓝牙是否开启搜索',
      //               showCancel: false,
      //               success: function (res) {
      //                 if (res.confirm) {
                      
      //                   wx.reLaunch({
      //                     url: '../map/map',
      //                   })
      //                 } else if (!res.cancel) {
                          
      //                   wx.reLaunch({
      //                     url: '../map/map',
      //                   })
      //                 }
      //               },

      //             })
      //           }
      //         },
      //         fail: function () {
      //           clearTimeout(overtime)

      //           wx.showModal({
      //             title: '蓝牙连接失败',
      //             content: '请检查蓝牙初始化失败',
      //             showCancel: false,
      //             success: function (res) {
      //               if (res.confirm) {
                    
      //                 wx.reLaunch({
      //                   url: '../map/map',
      //                 })
      //               } else if (!res.cancel) {
                        
      //                 wx.reLaunch({
      //                   url: '../map/map',
      //                 })
      //               }
      //             },

      //           })
      //         }

      //       })
      //     },
      //     fail: function (res) {//蓝牙失败后提示开启蓝牙
      //       clearTimeout(overtime)
      //       wx.showModal({
      //         title: '蓝牙连接失败',
      //         content: '请检查蓝牙是否开启搜索',
      //         showCancel: false,
      //         success: function (res) {
      //           if (res.confirm) {
                
      //             wx.reLaunch({
      //               url: '../map/map',
      //             })
      //           } else if (!res.cancel) {
                    
      //             wx.reLaunch({
      //               url: '../map/map',
      //             })
      //           }
      //         },

      //       })

      //     },
      //     complete: function (res) {

      //     }
      //   })
      // } else if (platform == "ios") {
      //   var serviceId = [];
      //   var characteristicsuuid = [];
      //   wx.openBluetoothAdapter({//检查蓝牙是否开启
      //     success: function (res) {
      //       wx.getBluetoothAdapterState({
      //         success: function (res) {
      //           console.log("检查蓝牙是否开启",res)
      //           wx.onNetworkStatusChange(function (res) {
      //             var NetworkStatus = res.isConnected;
      //               if (!NetworkStatus) {
      //                 clearTimeout(overtime)
      //                 wx.showLoading({
      //                   title: '网络已断开',
      //                   mask: true,

      //                 })
      //                 // setTimeout(function () {
      //                 //   wx.hideLoading();
      //                 //   wx.reLaunch({
      //                 //     url: '../map/map',
      //                 //   })
      //                 // }, 1500)
      //               }
      //           })
      //           if (!res.discovering && res.available) {
      //             wx.startBluetoothDevicesDiscovery({//开始搜索蓝牙
      //               services: ['FFF0'],
      //               success: function (res) {
      //                 console.log("开始搜索蓝牙",res);
      //                 setTimeout(function () {
      //                   wx.getBluetoothDevices({//获取搜索到的蓝牙设备
      //                     success: function (res) {
      //                       console.log("获取搜索到的蓝牙设备",res)
      //                       app.globalData.bluetootha = false;
      //                       for (var i = 0; i < res.devices.length; i++) {
      //                         console.log("id", Id)
      //                         if (((ab2hex(res.devices[i].advertisData)).toUpperCase()) == Id) {
      //                           app.globalData.bluetootha = true
      //                           var deviceId = res.devices[i].deviceId;
                                
      //                           console.log("deviceId",deviceId)
      //                           wx.setStorage({
      //                             key: 'deviceId',
      //                             data: deviceId,
      //                           })
      //                           wx.createBLEConnection({//连接蓝牙
      //                             // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      //                             deviceId: deviceId,
      //                             success: function (res) {
      //                               console.log( "连接蓝牙",res)
      //                               wx.stopBluetoothDevicesDiscovery({
      //                                 success: function (res) {
      //                                 }
      //                               })
      //                               wx.getBLEDeviceServices({
      //                                 // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      //                                 deviceId: deviceId,
      //                                 success: function (res) {
                                      
      //                                   var serviceId = res.services[0].uuid;
      //                                   wx.setStorage({
      //                                     key: 'serviceId',
      //                                     data: serviceId,
      //                                   })
      //                                   wx.getBLEDeviceCharacteristics({
      //                                     // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      //                                     deviceId: deviceId,
      //                                     // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      //                                     serviceId: serviceId,
      //                                     success: function (res) {
      //                                       consolo.log(res,'getBLE')
      //                                       var characteristicuuid = res.characteristics[1].uuid;
      //                                       var characteristicuuidwheather = res.characteristics[0].uuid;
      //                                       wx.setStorage({
      //                                         key: 'characteristicuuid',
      //                                         data: res.characteristics[0].uuid,
      //                                       })
      //                                       wx.readBLECharacteristicValue({
      //                                         deviceId: deviceId,
      //                                         serviceId: serviceId,
      //                                         characteristicId: characteristicuuidwheather,
      //                                         success: function (res) {
      //                                         },
      //                                         fail: function () {
      //                                         },
      //                                         complete: function () {
      //                                           wx.onBLECharacteristicValueChange(function (characteristic) {//读取蓝牙随机4个字节
      //                                             wx.onBLEConnectionStateChange(function (res) {
      //                                             });
      //                                             let buffer = characteristic.value;
      //                                             var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
      //                                             for (var i = 0; i < arr.length; i++) {
      //                                               str += String.fromCharCode(arr[i])
      //                                             }
                  
      //                                             var str = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
      //                                             console.log(str);
      //                                             if (str == "00") {//判断折是否再使用
      //                                               wx.readBLECharacteristicValue({
      //                                                 // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
      //                                                 deviceId: deviceId,
      //                                                 // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      //                                                 serviceId: serviceId,
      //                                                 // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      //                                                 characteristicId: characteristicuuid,
      //                                                 success: function (res) {
      //                                                 },
      //                                                 fail: function () {
      //                                                   clearTimeout(overtime)

      //                                                     ;
      //                                                   wx.showModal({
      //                                                     title: '蓝牙连接失败',
      //                                                     content: '请重新开启蓝牙',
      //                                                     showCancel: false,
      //                                                     success: function (res) {
      //                                                       if (res.confirm) {
                                                            
      //                                                         wx.reLaunch({
      //                                                           url: '../map/map',
      //                                                         })
      //                                                       } else if (res.cancel) {
                                                                
      //                                                         wx.reLaunch({
      //                                                           url: '../map/map',
      //                                                         })
      //                                                       }
      //                                                     },

      //                                                   })
      //                                                 },
      //                                                 complete: function () {
      //                                                   wx.onBLECharacteristicValueChange(function (characteristic) {
      //                                                     wx.onBLEConnectionStateChange(function (res) {
      //                                                     });
      //                                                     let buffer = characteristic.value;
      //                                                     var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
      //                                                     for (var i = 0; i < arr.length; i++) {
      //                                                       str += String.fromCharCode(arr[i])
      //                                                     }
                                         
      //                                                     var str = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join(''); if (str == "") {
      //                                                       ;
      //                                                       clearTimeout(overtime)

      //                                                       wx.showModal({
      //                                                         title: '蓝牙连接失败',
      //                                                         content: '请重新开启蓝牙',
      //                                                         showCancel: false,
      //                                                         success: function (res) {
      //                                                           if (res.confirm) {
                                                                
      //                                                             wx.reLaunch({
      //                                                               url: '../map/map',
      //                                                             })
      //                                                           } else if (res.cancel) {
                                                                    
      //                                                             wx.reLaunch({
      //                                                               url: '../map/map',
      //                                                             })
      //                                                           }
      //                                                         },

      //                                                       })
      //                                                     }
      //                                                     //握手算法请求接口
      //                                                     wx.request({
      //                                                       url: app.globalData.Route + "/api/sha1Controller/shake?code=" + Id + "&str=" + str,
      //                                                       method: "POST",
      //                                                       header: {
      //                                                         'Content-Type': 'application/ json;charset=UTF - 8;'
      //                                                       },
      //                                                       success: function (res) {
      //                                                         wx.onNetworkStatusChange(function (res) {
      //                                                           if (res.isConnected == "none") {
      //                                                             clearTimeout(overtime)
      //                                                           }
      //                                                         })
      //                                                         wx.onBLEConnectionStateChange(function (res) {
      //                                                         })
      //                                                         //处理返回结果
      //                                                         var secret = res.data.key;
      //                                                         var secret = secret.toUpperCase();
      //                                                         var hex = secret;
      //                                                         var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      //                                                           return parseInt(h, 16)
      //                                                         }));

      //                                                         var buffer = typedArray.buffer;
      //                                                         var dataview = new DataView(buffer);
      //                                                         var ints = new Uint8Array(buffer.byteLength);
      //                                                         for (var i = 0; i < ints.length; i++) {
      //                                                           ints[i] = dataview.getUint8(i);
      //                                                         }
      //                                                         var characteristics;
      //                                                         wx.getStorage({
      //                                                           key: 'characteristics',
      //                                                           success: function (res) {
      //                                                             characteristics = res.data.data.characteristics;
      //                                                           },
      //                                                         })
      //                                                         wx.writeBLECharacteristicValue({//写入数据
      //                                                           // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
      //                                                           deviceId: deviceId,
      //                                                           // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      //                                                           serviceId: serviceId,
      //                                                           // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      //                                                           characteristicId: characteristicuuid,
      //                                                           value: buffer,
      //                                                           success: function (res) {
      //                                                             //判断连接过程中蓝牙是否断开
      //                                                             var connectState = wx.getStorageSync("connectState");
      //                                                             clearTimeout(overtime)
      //                                                             wx.redirectTo({
      //                                                               url: '../pay/payList',//成功后跳到支付页面
      //                                                             })


      //                                                             wx.onBLECharacteristicValueChange(function (characteristic) {

      //                                                             })
      //                                                           },
      //                                                           fail: function (res) {
      //                                                             wx.reLaunch({
      //                                                               url: '../map/map',//失败后跳到失败页面
      //                                                             })
      //                                                           },
      //                                                           complete: function () {
      //                                                             wx.readBLECharacteristicValue({
      //                                                               // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
      //                                                               deviceId: deviceId,
      //                                                               // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      //                                                               serviceId: serviceId,
      //                                                               // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      //                                                               characteristicId: characteristicuuid,
      //                                                               success: function (res) {
      //                                                               }
      //                                                             })
      //                                                           }

      //                                                         })
      //                                                       },
      //                                                       fail: function (res) {
      //                                                         wx.onNetworkStatusChange(function (res) {
      //                                                           if (res.isConnected == "none") {
      //                                                             clearTimeout(overtime)
      //                                                           }
      //                                                         })
                    
      //                                                       }
      //                                                     })
      //                                                   })
      //                                                 }
      //                                               })

      //                                               wx.onBLEConnectionStateChange(function (res) {
      //                                                 var connectState = res.connected;
      //                                                 wx.setStorageSync("connectState", connectState)
      //                                               })
      //                                             } else if (str == "01") {
      //                                               clearTimeout(overtime)
      //                                               wx.showModal({
      //                                                 title: '温馨提示',
      //                                                 content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
      //                                                 showCancel: false,
      //                                                 success: function (res) {
      //                                                   wx.reLaunch({
      //                                                     url: '../map/map',
      //                                                   })
      //                                                 }
      //                                               })
      //                                             }
      //                                           })

      //                                         }
      //                                       })
      //                                     },
      //                                     fail: function () {
      //                                       wx.showModal({
      //                                         title: '蓝牙连接失败',
      //                                         content: '请重新开启蓝牙',
      //                                         showCancel: false,
      //                                         success: function (res) {
      //                                           if (res.confirm) {
                                                
      //                                             wx.reLaunch({
      //                                               url: '../map/map',
      //                                             })
      //                                           } else if (res.cancel) {
                                                    
      //                                             wx.reLaunch({
      //                                               url: '../map/map',
      //                                             })
      //                                           }
      //                                         },

      //                                       })
      //                                     }
      //                                   })
      //                                 },
      //                                 fail: function () {
      //                                   clearTimeout(overtime)
      //                                   wx.showModal({
      //                                     title: '蓝牙连接失败',
      //                                     content: '请重新开启蓝牙',
      //                                     showCancel: false,
      //                                     success: function (res) {
      //                                       if (res.confirm) {
                                            
      //                                         wx.reLaunch({
      //                                           url: '../map/map',
      //                                         })
      //                                       } else if (res.cancel) {
                                                
      //                                         wx.reLaunch({
      //                                           url: '../map/map',
      //                                         })
      //                                       }
      //                                     },

      //                                   })
      //                                 }

      //                               })
      //                             },
      //                             fail: function () {
      //                               clearTimeout(overtime)
      //                               wx.showModal({
      //                                 title: '蓝牙连接失败',
      //                                 content: '请重新开启蓝牙',
      //                                 showCancel: false,
      //                                 success: function (res) {
      //                                   if (res.confirm) {
      //                                     wx.reLaunch({
      //                                       url: '../map/map',
      //                                     })
      //                                   } else if (res.cancel) {
      //                                     wx.reLaunch({
      //                                       url: '../map/map',
      //                                     })
      //                                   }
      //                                 },

      //                               })

      //                             },

      //                           })
      //                         } else if ((ab2hex(res.devices[i].advertisData)) != Id) {
      //                           console.log("没有与之匹配的id")
      //                           console.log("当没有找到相关蓝牙后提示设备已经开启")
      //                           // wx.showModal({
      //                           //   title: '温馨提示',
      //                           //   content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
      //                           //   showCancel: false,
      //                           //   success: function (res) {
      //                           //     wx.reLaunch({
      //                           //       url: '../map/map',
      //                           //     })
      //                           //   }
      //                           // })
      //                         }
      //                       }
      //                       if (!app.globalData.bluetootha){
      //                         console.log("检测蓝牙是否有相同匹配项",app.globalData.bluetootha)
      //                         clearTimeout(overtime)
      //                         wx.showModal({
      //                           title: '温馨提示',
      //                           content: '设备已经开启，您可以直接充电或扫描其它设备二维码',
      //                           showCancel: false,
      //                           success: function (res) {
      //                             wx.reLaunch({
      //                               url: '../map/map',
      //                             })
      //                           }
      //                         })
      //                       }

      //                     },
      //                     fail: function () {
      //                       wx.showModal({
      //                         title: '蓝牙连接失败',
      //                         content: '请重新开启蓝牙',
      //                         showCancel: false,
      //                         success: function (res) {
      //                           clearTimeout(overtime)
      //                           if (res.confirm) {
                                
      //                             wx.reLaunch({
      //                               url: '../map/map',
      //                             })
      //                           } else if (res.cancel) {
                                    
      //                             wx.reLaunch({
      //                               url: '../map/map',
      //                             })
      //                           }
      //                         },

      //                       })
      //                     }
      //                   })
      //                 }, 3000)
      //               },
      //               fail: function () {
      //               }
      //             })

      //           } else {
      //             wx.showModal({
      //               title: '蓝牙连接失败',
      //               content: '请重新开启蓝牙',
      //               showCancel: false,
      //               success: function (res) {
      //                 if (res.confirm) {
                      
      //                   wx.reLaunch({
      //                     url: '../map/map',
      //                   })
      //                 } else if (res.cancel) {
                          
      //                   wx.reLaunch({
      //                     url: '../map/map',
      //                   })
      //                 }
      //               },

      //             })

      //           }
      //         },
      //         fail: function () {
      //           wx.showModal({
      //             title: '蓝牙连接失败',
      //             content: '请检查蓝牙是否开启搜索',
      //             showCancel: false,
      //             success: function (res) {
      //               if (res.confirm) {
                    
      //                 wx.reLaunch({
      //                   url: '../map/map',
      //                 })
      //               } else if (res.cancel) {
                        
      //                 wx.reLaunch({
      //                   url: '../map/map',
      //                 })
      //               }
      //             },

      //           })
      //         }
      //       })

      //     },
      //     fail: function (res) {//蓝牙失败后提示开启蓝牙
      //       wx.showModal({
      //         title: '蓝牙连接失败',
      //         content: '请检查蓝牙是否开启搜索',
      //         showCancel: false,
      //         success: function (res) {
      //           if (res.confirm) {
                
      //             wx.reLaunch({
      //               url: '../map/map',
      //             })
      //           } else if (res.cancel) {
                    
      //             wx.reLaunch({
      //               url: '../map/map',
      //             })
      //           }
      //         },

      //       })

      //     },
      //     complete: function (res) {
      //       wx.onBLEConnectionStateChange(function (res) {
      //       })
      //     }
      //   })


      // }


    } else {  // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
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
        },

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
  onUnloa: function () {

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