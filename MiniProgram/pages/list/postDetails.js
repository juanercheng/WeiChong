// pages/list/listDetails.js
const app = getApp()
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

  /**
   * 页面的初始数据
   */
  data: {
    details:"",
    imgData:"",
    token:"",
    userId:0,
    hiddenLoading:true,
    id:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
      mask: true
    }),
    wx.setNavigationBarTitle({
      title: '驿站详情'
    }),
    //获取缓存列表数据
    wx.getStorage({
      key: 'login',
      success: function (res) {
        that.data.token = res.data.data.accessToken;
        that.data.userId = res.data.data.userId;
        wx.request({//查询无线充详情
          url: app.globalData.Route + "/api/wireless/findWirelessDetail",
          data: {
            id: options.id,
            userId: that.data.userId,
            accessToken: that.data.token
          },
          method: "POST",
          header: {
            'Content-Type': 'application/x-www-form-urlencoded;'
          },
          success: function (res) {
            wx.hideLoading()
            that.setData({
              id: res.data.object.userId
            })
            wx.setStorage({
              key: "business",
              data: res
            })
            var list = res.data.object;
            //将经纬度转成数字类型，方便后面使用
            list.lat = list.lat - 0;
            list.lat = list.lat * 1;
            list.lng = list.lng - 0;
            list.lng = list.lng * 1;
            list.imgurl = app.globalData.Route + list.imgurl
            var img = res.data.object.recommendImgs
            var imgData = img.split(",")
            for (var i = 0; i < imgData.length; i++) {
              imgData[i] = app.globalData.Route + imgData[i]
            }

            that.setData({
              details: list,
              imgData: imgData,
              hiddenLoading: !that.data.hiddenLoading
            });
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
  },
  goStoreDetails: function (e) {
    var that = this ; 
    var id = that.data.id;
    wx.showLoading({
      title: '正在跳转',
      mask: true
    })
    setTimeout(function () {
      wx.navigateTo({
        url: '../list/storeDetails?id=' + id,
        success: function () {
          wx.hideLoading();
          clearTimeout();
        }
      })
    }, 1000)
   
  },
  //打开位置
  go: function () {
    var that = this
    var position = MapabcEncryptToBdmap(that.data.details.lat, that.data.details.lng);
    wx.openLocation({
      latitude: position.lat,
      longitude: position.lng,
      name: that.data.details.address,
      address: that.data.details.address
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