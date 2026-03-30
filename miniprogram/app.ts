// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 初始化 CloudBase
    wx.cloud.init({
      env: 'cloud1-4gs1rgg8854b4ac1', // CloudBase 环境 ID
      traceUser: true
    })

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
})