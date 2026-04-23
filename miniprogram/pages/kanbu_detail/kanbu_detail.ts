Page({
  data: {
    statusBarHeight: 20,
    navBarTotalHeight: 64,
    menuButtonTop: 26,
    menuButtonHeight: 32,
    currentImageIndex: 0,
    productImages: [
      '/images/my/head.svg',
      '/images/my/head.svg',
      '/images/my/head.svg',
      '/images/my/head.svg',
      '/images/my/head.svg'
    ],
    productName: '百雀羚保湿霜补水滋润乳液面霜女男士官方正品',
    vitalityPrice: 898,
    originalPrice: '22.0',
    remaining: 23,
    remainingCodes: 6,
    countdown: { hours: '12', minutes: '23', seconds: '56' },
    currentSteps: 3000,
    progressPercent: 33.3,
    mySteps: 3000,
    friendSteps: 0,
    remainSteps: 6000,
    records: [
      { avatar: '/images/my/head.svg', name: '用户A', time: '2分钟前', steps: 500 },
      { avatar: '/images/my/head.svg', name: '用户B', time: '5分钟前', steps: 300 },
      { avatar: '/images/my/head.svg', name: '用户C', time: '10分钟前', steps: 200 }
    ] as any[]
  },

  _timer: null as any,

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

    // TODO: load product detail from options.id
    this.startCountdown()
  },

  onUnload() {
    if (this._timer) {
      clearInterval(this._timer)
    }
  },

  startCountdown() {
    // Mock: countdown from 12:23:56
    let total = 12 * 3600 + 23 * 60 + 56
    this._timer = setInterval(() => {
      if (total <= 0) {
        clearInterval(this._timer)
        return
      }
      total--
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      this.setData({
        'countdown.hours': String(h).padStart(2, '0'),
        'countdown.minutes': String(m).padStart(2, '0'),
        'countdown.seconds': String(s).padStart(2, '0')
      })
    }, 1000)
  },

  handleBack() {
    wx.navigateBack()
  },

  onSwiperChange(e: any) {
    this.setData({ currentImageIndex: e.detail.current })
  },

  onActivityInfo() {
    wx.showToast({ title: '每日限量，先到先得', icon: 'none' })
  },

  onViewAllRecords() {
    wx.showToast({ title: '全部记录', icon: 'none' })
  },

  onKanbu() {
    // TODO: share to friends for step contribution
    wx.showToast({ title: '邀请好友砍步数', icon: 'none' })
  }
})
