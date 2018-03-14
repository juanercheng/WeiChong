// pages/list/list.js
const app = getApp()
function MapabcEncryptToBdmap(gg_lat, gg_lon) {
  var point = new Object();
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var x = new Number(gg_lon);
  var y = new Number(gg_lat);
  var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  var bd_lon = z * Math.cos(theta) + 0.0065;
  var bd_lat = z * Math.sin(theta) + 0.006;
  point.lng = bd_lon;
  point.lat = bd_lat;
  //alert("-1:"+point.lng+","+point.lat);  
  return point;
}    
Page({
  /**
   * 页面的初始数据
   */
  data: {
    token: "",
    isHideLoadMore: false,
    listData: [],
    hiddenLoading: true,
    chargeS: 0,
    postList: true,
    mapPattern: false,
    latitude: 0,
    longitude: 0,
    userV: false,
    chargeInfomation: false,
    user: "",
    chargeImg: "",
    chargeAdress: "",
    chargelength: "",
    chargeName: "",
    chargeS: '../../images/charge.png',
    usertop: 0,
    userleft: 0,
    nextPage: 1,
    stop: true,
    //false默认未获取地址
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
    firstBar: true,
    loading: false,
  },
  errImg: function (e) {
    var errorImgIndex = e.target.dataset.errorimg
    var imgObject = "carlistData[" + errorImgIndex + "].img"
    var errorImg = {}
    errorImg[imgObject] = "../../images/error.png"
    this.setData(errorImg);
  },
  goListDetails: function (e) {
    var id = e.currentTarget.id
    wx.showLoading({
      title: '正在跳转',
      mask: true
    })
    setTimeout(function () {
      wx.navigateTo({
        url: '../list/postDetails?id=' + id,
        success: function () {
          wx.hideLoading();
          clearTimeout();
        }
      })
    }, 1000)
  },
  //切换地图模式
  tapMapPattern: function () {
    wx.reLaunch({
      url: '../map/map',
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (nextpage) {
    if (nextpage % 1 === 0 ){
      var nextpage = nextpage
    }else{
      var nextpage = 0
    }
    var that = this;
    that.setData({
      stop: true
    })
    wx.getSystemInfo({
      success: function (res) {
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
        that.setData({
          userleft: res.windowWidth - 60,
          usertop: 10,
        })
      }
    })
    wx.showLoading({
      title: '正在加载',
      mask: true
    }),
      //获取登录信息
      wx.getStorage({
        key: 'login',
        success: function (res) {
          that.data.token = res.data.data.accessToken;
          wx.setStorageSync('token', that.data.token)
          //获取位置信息
          wx.getStorage({
            key: 'location',
            success: function (res) {
              var lng = res.data.longitude;
              var lat = res.data.latitude
              var position = MapabcEncryptToBdmap(lat,lng);
              lat = parseFloat(position.lat);
              lng = parseFloat(position.lng);
              wx.request({//请求附近电桩
                url: app.globalData.Route + "/api/wireless/findWirelessList",
                data: {
                  lng: lng,
                  lat: lat,
                  accessToken: that.data.token,
                  wireType: 1,
                  nextPage: nextpage
                },
                method: "POST",
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded;'
                },
                success: function (res) {
                  var totalPages = res.data.object.totalPages
                  app.globalData.totalPages = totalPages
                  wx.hideLoading()
                  var list = res.data.object.content
                    list.map(function (value) {
                      value.imgurl = app.globalData.Route + value.imgurl
                      that.data.listData.push(value)
                    })
                    var listData = that.data.listData
                    that.setData({
                      listData: listData,
                      hiddenLoading: !that.data.hiddenLoading,
                      loading: true,
                    });
                    that.setData({
                      isHideLoadMore: false
                    })
                },
                fail: function (res) {
                  wx.hideLoading()
                  wx.showToast({
                    title: '请检查网络链接',
                  })
                }
              })
            }
          })
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


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */

  onPullDownRefresh: function () {
    var that = this
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载
    setTimeout(function () {
      that.data.listData = []
      app.globalData.nextPage = 0
      var nextPage = 0
      // complete
      that.onLoad(nextPage)
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
      var that = this
      if (that.data.stop) {
        that.setData({
          isHideLoadMore: true
        })
        app.globalData.nextPage = app.globalData.nextPage + 1;
        var nextPage = app.globalData.nextPage;
        if (nextPage <= app.globalData.totalPages) {
          that.onLoad(nextPage)
        } else {
          wx.showToast({
            title: '已是最后页数',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            stop: false
          })
          that.setData({
            isHideLoadMore: false
          })
        }
      }
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})