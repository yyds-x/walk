/**
 * 微信登录工具函数
 */

/**
 * 执行微信登录 - 通过云函数获取用户信息
 * @param callback 登录成功后的回调函数
 */
export function wxLogin(callback?: (userInfo: any) => void) {
  // 调用云函数获取用户信息
  wx.cloud.callFunction({
    name: 'getUserInfo',
    success: (res) => {
      console.log('获取用户信息成功:', res.result)
      const result = res.result as any
      const userInfo = {
        openid: result?.openid || '',
        appid: result?.appid || '',
        unionid: result?.unionid || '',
        nickName: '微信用户',
        avatarUrl: '/images/head.png'
      }
      // 保存用户信息
      wx.setStorageSync('userInfo', userInfo)
      console.log('登录成功')
      if (callback) {
        callback(userInfo)
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