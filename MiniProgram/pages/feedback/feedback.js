Page({

  /**
   * 页面的初始数据
   */
  data: { 

  },
  formSubmit: function (e) {
    console.log(e)
    if (e.detail.value.textarea == "" || e.detail.value.radio == "") {
      wx.showModal({
        title: '温馨提示',
        content: '请选择和填写反馈内容',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    }else{
      wx.showModal({
        title: '提交成功',
        content: '提交成功，感谢您的问题反馈!',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.navigateTo({
              url: '../user/user'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
            wx.navigateTo({
              url: '../user/user'
            })
          }
        }
      })
    }
  },
  submit:function(){
wx.navigateTo({
  url: '../map/map',
  
})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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