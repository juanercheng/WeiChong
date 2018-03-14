// pages/about/about.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scene: ''
  },
  call:function(){
    wx.makePhoneCall({
      phoneNumber: '400-6608-115' //仅为示例，并非真实的电话号码
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var scene_img = app.globalData.Route + "//upload//code//code.png" //这里添加图片的地址 
    app.globalData.homeRefresh=false;//设备返回首页是否刷新 
    that.setData({
      scene: scene_img
    })   
    wx.setNavigationBarTitle({
      title: '关于微充'
    })
  },
  previewImage: function (e) {
    console.log(this.data.scene)
    wx.previewImage({
      urls: [this.data.scene] // 需要预览的图片http链接列表   
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