/**
 * 微信登录工具函数
 */

/**
 * 执行微信登录 - 通过云函数获取用户信息
 * @param callback 登录成功后的回调函数
 */
export function wxLogin(callback?: (userInfo: any) => void) {
  // 调用统一登录云函数
  wx.cloud.callFunction({
    name: 'login',
    success: (res) => {
      console.log('登录成功:', res.result)
      const result = res.result as any
      if (result.code === 0) {
        const userInfo = result.data
        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', userInfo)
        console.log('用户信息已保存:', userInfo)
        if (callback) {
          callback(userInfo)
        }
      } else {
        console.error('登录失败:', result.message)
        wx.showToast({
          title: result.message || '登录失败',
          icon: 'error'
        })
      }
    },
    fail: (error) => {
      console.error('调用云函数失败:', error)
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      })
    }
  })
}

/**
 * 检查登录状态
 * @returns 是否已登录
 */
export function isLoggedIn(): boolean {
  const userInfo = wx.getStorageSync('userInfo')
  return userInfo && userInfo.openid
}

/**
 * 获取本地存储的用户信息
 * @returns 用户信息
 */
export function getUserInfo() {
  return wx.getStorageSync('userInfo')
}

/**
 * 退出登录
 */
export function logout() {
  wx.removeStorageSync('userInfo')
}