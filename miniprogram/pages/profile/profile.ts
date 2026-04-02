import { isLoggedIn, getUserInfo, logout } from '../../utils/login'

Page({
  data: {
    userInfo: {
      avatarUrl: '',
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
            avatarUrl: userInfo.avatarUrl ,
            nickName: userInfo.nickName ,
            id: userInfo.appid || userInfo.openid 
          }
        })
      }
    } else {
      wx.navigateBack()
    }
  },

  onChooseAvatar(e: any) {
    const avatarUrl = e.detail.avatarUrl
    if (!avatarUrl) return

    wx.showLoading({ title: '上传中...' })

    // 上传到云存储
    const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.png`
    wx.cloud.uploadFile({
      cloudPath,
      filePath: avatarUrl,
      success: (uploadRes) => {
        const fileID = uploadRes.fileID
        // 调用云函数更新数据库
        wx.cloud.callFunction({
          name: 'updateUserInfo',
          data: {
            openid: getUserInfo()?.openid,
            avatarUrl: fileID
          },
          success: () => {
            this.setData({ 'userInfo.avatarUrl': fileID })
            const currentUserInfo = getUserInfo() || {}
            wx.setStorageSync('userInfo', { ...currentUserInfo, avatarUrl: fileID })
            wx.showToast({ title: '头像已更新', icon: 'success' })
          },
          fail: (err) => {
            console.error('更新数据库失败:', err)
            wx.showToast({ title: '更新失败', icon: 'error' })
          }
        })
      },
      fail: (err) => {
        console.error('上传失败:', err)
        wx.showToast({ title: '上传失败', icon: 'error' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
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
