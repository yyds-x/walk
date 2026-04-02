// 云函数入口文件 - 统一登录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取微信登录上下文
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const appid = wxContext.APPID
    const unionid = wxContext.UNIONID || ''

    // 获取数据库引用
    const db = cloud.database()
    
    // 查询用户是否存在
    const userQuery = await db.collection('users').where({
      openid: openid
    }).get()

    let userData = null
    let isNewUser = false

    if (userQuery.data.length === 0) {
      // 新用户，创建记录
      const newUser = {
        openid: openid,
        appid: appid,
        unionid: unionid,
        nickName: '微信用户',
        avatarUrl: '/images/head.png',
        createTime: new Date().getTime(),
        updateTime: new Date().getTime(),
        loginCount: 1,
        lastLoginTime: new Date().getTime(),
        vitalityBalance: 0,
        checkinStreak: 0,
        lastCheckinDate: '',
        totalCheckin: 0
      }
      
      const addResult = await db.collection('users').add({
        data: newUser
      })
      
      userData = {
        ...newUser,
        _id: addResult._id
      }
      isNewUser = true
      console.log('新用户创建成功:', openid)
    } else {
      // 已有用户，更新登录信息
      userData = userQuery.data[0]
      const updateData = {
        updateTime: new Date().getTime(),
        lastLoginTime: new Date().getTime(),
        loginCount: (userData.loginCount || 0) + 1
      }
      
      await db.collection('users').doc(userData._id).update({
        data: updateData
      })
      
      // 更新本地数据
      userData = {
        ...userData,
        ...updateData
      }
      console.log('用户登录信息更新成功:', openid)
    }

    // 返回用户信息
    return {
      code: 0,
      message: '登录成功',
      data: {
        openid: userData.openid,
        appid: userData.appid,
        unionid: userData.unionid,
        nickName: userData.nickName,
        avatarUrl: userData.avatarUrl,
        vitalityBalance: userData.vitalityBalance || 0,
        checkinStreak: userData.checkinStreak || 0,
        lastCheckinDate: userData.lastCheckinDate || '',
        totalCheckin: userData.totalCheckin || 0,
        isNewUser: isNewUser,
        loginCount: userData.loginCount
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      code: -1,
      message: error.message || '登录失败',
      data: null
    }
  }
}
