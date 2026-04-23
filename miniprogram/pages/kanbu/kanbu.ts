Page({
  data: {
    statusBarHeight: 20,
    navBarTotalHeight: 64,
    menuButtonTop: 26,
    menuButtonHeight: 32,
    activeTab: 0,
    tabs: ['推荐', '美食', '服饰', '日用品', '化妆品', '门店优惠'],
    featuredItems: [
      { id: 'f1', name: '百雀羚保湿霜补水滋润乳液面霜女男…', steps: 6000, price: '26.0', image: '/images/my/head.svg' },
      { id: 'f2', name: 'AUPRES/欧珀莱俊士控油凝露男士…', steps: 3000, price: '26.0', image: '/images/my/head.svg' },
      { id: 'f3', name: '绿箭无糖薄荷糖铁盒约35粒 4瓶…', steps: 3000, price: '26.0', image: '/images/my/head.svg' }
    ],
    products: [
      { id: 'p1', name: '9.9元看电影(北滘商业广场大地影院)', steps: 3000, price: '26.0', image: '/images/my/head.svg' },
      { id: 'p2', name: '9.9元看电影(北滘商业广场大地影院)', steps: 3000, price: '26.0', image: '/images/my/head.svg' },
      { id: 'p3', name: '9.9元看电影(北滘商业广场大地影院)', steps: 3000, price: '26.0', image: '/images/my/head.svg' },
      { id: 'p4', name: '9.9元看电影(北滘商业广场大地影院)', steps: 3000, price: '26.0', image: '/images/my/head.svg' }
    ]
  },

  onLoad() {
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

  onTabTap(e: any) {
    const index = e.currentTarget.dataset.index
    this.setData({ activeTab: index })
    // TODO: filter products by category
  },

  onMoreRecommend() {
    wx.showToast({ title: '更多推荐', icon: 'none' })
  },

  onItemTap(e: any) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({ url: `/pages/kanbu_detail/kanbu_detail?id=${item.id}` })
  }
})
