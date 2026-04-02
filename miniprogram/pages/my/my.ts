import { wxLogin, isLoggedIn, getUserInfo } from '../../utils/login'

Page({
  data: {
    userInfo: {
      avatarUrl: '/images/my/head.svg',
      nickName: '登录/注册',
      id: '354334'
    },
    stats: {
      balance: '45.50',
      income: '0.32',
      inviteCount: '12'
    },
    menuItems: [
      { id: 1, name: '排行榜', icon: '/images/my/paihangbang.svg' },
      { id: 2, name: '兑换券', icon: '/images/my/duihuanjuan.svg' },
      { id: 3, name: '分销商', icon: '/images/my/fenxiaoshang.svg' },
      { id: 4, name: '我的金库', icon: '/images/my/wodejingku.svg' },
      { id: 5, name: '推广中心', icon: '/images/my/tuiguangzhongxing.svg' },
      { id: 6, name: '邀请好友', icon: '/images/my/yaoqinghaoyou.svg' },
      { id: 7, name: '常见问题', icon: '/images/my/changjianwenti.svg' },
      { id: 8, name: '联系我们', icon: '/images/my/lianxiwomen.svg' }
    ],
    services: [
      { id: 1, title: '积分兑换', subtitle: 'V联盟积分好礼', icon: '/images/my/jifenduihuan.svg' },
      { id: 2, title: '好店推荐', subtitle: '推荐商家', icon: '/images/my/haodiantuijian.svg' },
      { id: 3, title: '会员服务', subtitle: '线下自主设备', icon: '/images/my/huiyuanfuwu.svg' },
      { id: 4, title: '领券中心', subtitle: '领券尽享优惠', icon: '/images/my/lingjuanzhongxing.svg' }
    ],
    isLoggedIn: false,
    isLoading: false
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    this.updateLoginStatus()
  },

  onLoad() {
    this.updateLoginStatus()
  },

  updateLoginStatus() {
    const loggedIn = isLoggedIn()
    this.setData({ isLoggedIn: loggedIn })
    if (loggedIn) {
      const userInfo = getUserInfo()
      if (userInfo) {
        this.setData({
          userInfo: {
            ...this.data.userInfo,
            ...userInfo,
            id: userInfo.appid || userInfo.openid || this.data.userInfo.id
          },
          stats: {
            ...this.data.stats,
            balance: String(userInfo.vitalityBalance ?? this.data.stats.balance)
          }
        })
      }
    } else {
      this.setData({
        userInfo: {
          avatarUrl: '/images/my/head.svg',
          nickName: '登录/注册',
          id: '354334'
        },
        stats: {
          ...this.data.stats,
          balance: '0'
        }
      })
    }
  },

  onUserInfoTap() {
    if (this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/profile/profile' })
    } else {
      this.handleLogin()
    }
  },

  handleLogin() {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })
    wx.showLoading({ title: '登录中...', mask: true })
    wxLogin((userInfo) => {
      this.setData({
        isLoggedIn: true,
        isLoading: false,
        userInfo: {
          ...this.data.userInfo,
          ...userInfo,
          id: userInfo.appid || userInfo.openid
        },
        stats: {
          ...this.data.stats,
          balance: String(userInfo.vitalityBalance ?? this.data.stats.balance)
        }
      })
      wx.hideLoading()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    })
  },









  handleCheckIn() {
    if (this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/checkin/checkin' })
      return
    }
    if (this.data.isLoading) return
    this.setData({ isLoading: true })
    wx.showLoading({ title: '登录中...', mask: true })
    wxLogin((userInfo) => {
      this.setData({
        isLoggedIn: true,
        isLoading: false,
        userInfo: {
          ...this.data.userInfo,
          ...userInfo,
          id: userInfo.appid || userInfo.openid
        },
        stats: {
          ...this.data.stats,
          balance: String(userInfo.vitalityBalance ?? this.data.stats.balance)
        }
      })
      wx.hideLoading()
      wx.navigateTo({ url: '/pages/checkin/checkin' })
    })
  },

  handleMenuClick(e: any) {
    const item = e.currentTarget.dataset.item;
    console.log('Clicked menu:', item.name);
    // Navigate or handle action
  }
})
