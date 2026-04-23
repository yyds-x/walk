Page({
  data: {
    statusBarHeight: 20,
    navBarTotalHeight: 64,
    menuButtonTop: 26,
    menuButtonHeight: 32,
    shopName: '往事如风鲜花店',
    originalPrice: 130,
    totalLevels: 3,
    currentLevel: 0,
    progressPercent: 0,
    hasMoreParticipants: true,
    notifications: [
      { avatar: '/images/my/head.svg', text: '希望小哥23分钟前开启了幸运礼盒' },
      { avatar: '/images/my/head.svg', text: '话语元月23分钟前开启了幸运礼盒' }
    ],
    participants: [
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' },
      { avatar: '/images/my/head.svg' }
    ],
    rules: [
      '1.此商品闯关成功后，兑奖时请厨师兑奖码给店员核销即可使用',
      '2.此商品闯关成功后有效期为7天，逾期无效',
      '3.所获大奖为指定套餐，不与其它优惠同享'
    ]
  },

  onLoad(options: any) {
    const { statusBarHeight } = wx.getSystemInfoSync()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height
    this.setData({
      statusBarHeight: statusBarHeight || 20,
      navBarTotalHeight: (statusBarHeight || 20) + (navBarHeight || 44),
      menuButtonTop: menuButtonInfo.top || 26,
      menuButtonHeight: menuButtonInfo.height || 32
    })
  },

  handleBack() {
    wx.navigateBack()
  },

  startChallenge() {
    wx.showToast({ title: '闯关功能开发中', icon: 'none' })
  },

  viewMore() {
    wx.showToast({ title: '查看更多参与者', icon: 'none' })
  }
})
