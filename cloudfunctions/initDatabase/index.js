// 云函数入口文件 - 初始化数据库
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const db = cloud.database()
    
    // 检查 users 集合是否已存在
    const userCollectionExists = await checkCollectionExists(db, 'users')
    
    if (!userCollectionExists) {
      // 创建用户数据样例
      const sampleUser = {
        openid: 'sample_openid_001',
        appid: 'sample_appid',
        unionid: '',
        nickName: '示例用户',
        avatarUrl: '/images/my/head.png',
        createTime: new Date().getTime(),
        updateTime: new Date().getTime(),
        loginCount: 0,
        lastLoginTime: new Date().getTime()
      }
      
      // 插入样例数据（如果集合不存在会自动创建）
      await db.collection('users').add({
        data: sampleUser
      })
      
      console.log('已创建 users 集合并插入样例数据')
    }
    
    return {
      code: 0,
      message: '数据库初始化成功',
      data: {
        usersCollection: userCollectionExists ? '已存在' : '已创建'
      }
    }
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      code: -1,
      message: error.message || '数据库初始化失败',
      data: null
    }
  }
}

// 检查集合是否存在
async function checkCollectionExists(db, collectionName) {
  try {
    const result = await db.collection(collectionName).limit(1).get()
    return true
  } catch (error) {
    // 如果集合不存在会抛出错误
    return false
  }
}
