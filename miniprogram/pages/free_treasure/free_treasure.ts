type NotificationItem = {
  id: string
  avatar: string
  text: string
}

type RecordItem = {
  id: string
  avatar: string
  text: string
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function buildNodeClass(ownedCodes: number, threshold: number) {
  return ownedCodes >= threshold ? 'active' : ''
}

Page({
  data: {
    statusBarHeight: 0,
    navBarTotalHeight: 64,
    menuButtonTop: 26,
    menuButtonHeight: 32,

    images: ['/images/challenge/hero.jpg', '/images/challenge/hero.jpg', '/images/challenge/hero.jpg', '/images/challenge/hero.jpg', '/images/challenge/hero.jpg'] as string[],
    imagesCount: 5,
    currentIndex: 1,

    notifications: [
      { id: 'n1', avatar: '/images/my/head.svg', text: '希望小哥23分钟前开启了幸运礼盒' },
      { id: 'n2', avatar: '/images/my/head.svg', text: '希望小哥1小时前夺宝成功赢得大奖' },
      { id: 'n3', avatar: '/images/my/head.svg', text: '希望小哥45分钟前参与了夺宝' }
    ] as NotificationItem[],

    productTitle: '白千层肚150g新鲜毛肚牛杂涮火锅食材',
    remainCount: 23,
    periodNo: '201923489234',
    totalShares: 50,
    currentShares: 24,
    progressPercent: 48,
    remainShares: 26,

    ownedCodes: 5,
    needMoreCodes: 6,
    codePercent: 50,
    node0Class: 'active',
    node4Class: 'active',
    node8Class: '',
    node10Class: '',

    recordCount: 23,
    records: [
      { id: 'r1', avatar: '/images/my/head.svg', text: '希望小哥23分钟前开启了幸运礼盒' },
      { id: 'r2', avatar: '/images/my/head.svg', text: '希望小哥1小时前夺宝成功赢得大奖' },
      { id: 'r3', avatar: '/images/my/head.svg', text: '希望小哥45分钟前参与了夺宝' }
    ] as RecordItem[]
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height
    const navBarTotalHeight = statusBarHeight + (navBarHeight || 44)

    this.setData({
      statusBarHeight,
      navBarTotalHeight,
      menuButtonTop: menuButtonInfo.top || 26,
      menuButtonHeight: menuButtonInfo.height || 32
    })

    this.recompute()
  },

  handleSwiperChange(e: WechatMiniprogram.SwiperChange) {
    const current = Number((e.detail as any).current || 0)
    this.setData({ currentIndex: current + 1 })
  },

  handleBack() {
    wx.navigateBack()
  },

  handleMore() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  handleViewMyCodes() {
    wx.showModal({
      title: '我的夺宝号码',
      content: '示例：A12345、A12346、A12347、A12348、A12349',
      showCancel: false
    })
  },

  handleViewAllRecords() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  handleJoin() {
    const nextOwnedCodes = this.data.ownedCodes + 1
    const nextShares = this.data.currentShares + 1
    this.setData({
      ownedCodes: nextOwnedCodes,
      currentShares: nextShares
    })
    this.recompute()
    wx.showToast({ title: '已获得1个夺宝码', icon: 'none' })
  },

  recompute() {
    const imagesCount = Array.isArray(this.data.images) ? this.data.images.length : 0
    const totalShares = Number(this.data.totalShares || 0)
    const currentShares = Number(this.data.currentShares || 0)
    const progressPercent = totalShares > 0 ? clamp(Math.round((currentShares / totalShares) * 100), 0, 100) : 0
    const remainShares = Math.max(0, totalShares - currentShares)

    const ownedCodes = Number(this.data.ownedCodes || 0)
    const codePercent = clamp(Math.round((ownedCodes / 10) * 100), 0, 100)
    const needMoreCodes = Math.max(0, 10 - ownedCodes)

    this.setData({
      imagesCount,
      progressPercent,
      remainShares,
      codePercent,
      needMoreCodes,
      node0Class: buildNodeClass(ownedCodes, 0),
      node4Class: buildNodeClass(ownedCodes, 4),
      node8Class: buildNodeClass(ownedCodes, 8),
      node10Class: buildNodeClass(ownedCodes, 10)
    })
  }
})

