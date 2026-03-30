// 云函数入口文件 - 更新用户信息
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { openid, nickName, avatarUrl } = event
    
    // 获取微信登录上下文
    const wxContext = cloud.getWXContext()
    
    // 验证 openid
    if (openid !== wxContext.OPENID) {
      return {
        code: -1,
        message: '无权操作',
        data: null
      }
    }
    
    // 获取数据库引用
    const db = cloud.database()
    
    // 查询用户
    const userQuery = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (userQuery.data.length === 0) {
      return {
        code: -1,
        message: '用户不存在',
        data: null
      }
    }
    
    // 更新用户信息
    const updateData: any = {
      updateTime: new Date().getTime()
    }
    
    if (nickName) {
      updateData.nickName = nickName
    }
    
    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl
    }
    
    await db.collection('users').doc(userQuery.data[0]._id).update({
      data: updateData
    })
    
    return {
      code: 0,
      message: '更新成功',
      data: updateData
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return {
      code: -1,
      message: error.message || '更新用户信息失败',
      data: null
    }
  }
}
