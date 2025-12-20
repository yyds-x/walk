Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
  },
  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    // Calculate nav bar height based on menu button position
    // (top - statusBarHeight) is the top padding, multiply by 2 for bottom padding, plus height
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height;
    
    this.setData({
      statusBarHeight,
      navBarHeight: navBarHeight || 44
    })
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  }
})
