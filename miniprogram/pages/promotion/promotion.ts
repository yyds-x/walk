import { wxLogin, isLoggedIn } from '../../utils/login'

Page({
  data: {
    todayIncomeDisplay: '0.00',
    totalIncome: '0.00',
    merchantCount: '0',
    orderCount: '0',
    menuItems: [
      { id: 1, name: '我的店铺', icon: '/images/promotion/shop.svg' },
      { id: 2, name: '查看订单', icon: '/images/promotion/order.svg' },
      { id: 3, name: '邀请商家入驻', icon: '/images/promotion/invite.svg' },
      { id: 4, name: '已入驻的商家平台', icon: '/images/promotion/platform.svg' }
    ],
    showBanner: true
  },

  onLoad() {
    if (isLoggedIn()) {
      this.loadData()
    } else {
      wxLogin(() => this.loadData())
    }
  },

  loadData() {
    // Placeholder stats — replace with real cloud function later
    this.setData({
      todayIncomeDisplay: '69.00',
      totalIncome: '45.50',
      merchantCount: '69',
      orderCount: '12'
    })
  },

  onMenuTap(e: any) {
    const item = e.currentTarget.dataset.item
    wx.showToast({ title: item && item.name ? item.name : '功能开发中', icon: 'none' })
  },

  onBannerTap() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  closeBanner() {
    this.setData({ showBanner: false })
  }
})
