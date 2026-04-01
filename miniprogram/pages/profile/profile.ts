import { isLoggedIn, getUserInfo, logout } from '../../utils/login'

Page({
  data: {
    userInfo: {
      avatarUrl: '/images/my/head.svg',
      nickName: '',
      id: ''
    },
    isLoggedIn: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const loggedIn = isLoggedIn()
    if (loggedIn) {
      const userInfo = getUserInfo()
      if (userInfo) {
        this.setData({
          isLoggedIn: true,
          userInfo: {
            avatarUrl: userInfo.avatarUrl || '/images/my/head.svg',
            nickName: userInfo.nickName || '',
            id: userInfo.appid || userInfo.openid || ''
          }
        })
      }
    } else {
      wx.navigateBack()
    }
  },

  onChooseAvatar(e: any) {
    const avatarUrl = e.detail.avatarUrl
    if (avatarUrl) {
      this.setData({ 'userInfo.avatarUrl': avatarUrl })
      const currentUserInfo = getUserInfo() || {}
      wx.setStorageSync('userInfo', { ...currentUserInfo, avatarUrl })
    }
  },

  onNicknameInput(e: any) {
    const nickName = e.detail.value
    if (nickName) {
      this.setData({ 'userInfo.nickName': nickName })
      const currentUserInfo = getUserInfo() || {}
      wx.setStorageSync('userInfo', { ...currentUserInfo, nickName })
    }
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  }
})
