const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

function getChinaDateStr(ts = Date.now()) {
  const chinaTs = ts + 8 * 60 * 60 * 1000
  return new Date(chinaTs).toISOString().slice(0, 10)
}

function isCollectionNotExistError(e) {
  const msg = String(e?.errMsg || e?.message || '')
  return msg.includes('DATABASE_COLLECTION_NOT_EXIST') || msg.includes('collection not exists') || msg.includes('-502005')
}

async function ensureCollections(db) {
  const names = ['checkin_records', 'vitality_ledger']
  for (const name of names) {
    try {
      await db.createCollection(name)
    } catch (e) {}
  }
}

async function getOrCreateUser(db, openid, appid, unionid) {
  const userQuery = await db.collection('users').where({ openid }).get()
  if (userQuery.data.length > 0) return userQuery.data[0]

  const now = Date.now()
  const newUser = {
    openid,
    appid,
    unionid: unionid || '',
    nickName: '微信用户',
    avatarUrl: '/images/head.png',
    createTime: now,
    updateTime: now,
    loginCount: 0,
    lastLoginTime: 0,
    vitalityBalance: 0,
    checkinStreak: 0,
    lastCheckinDate: '',
    totalCheckin: 0
  }

  const addResult = await db.collection('users').add({ data: newUser })
  return { ...newUser, _id: addResult._id }
}

async function getLedger(db, openid, offset = 0, pageSize = 20) {
  try {
    const res = await db
      .collection('vitality_ledger')
      .where({ openid })
      .orderBy('createdAt', 'desc')
      .skip(offset)
      .limit(pageSize)
      .get()
    return res.data || []
  } catch (e) {
    if (isCollectionNotExistError(e)) {
      await ensureCollections(db)
      return []
    }
    throw e
  }
}

exports.main = async (event, context) => {
  try {
    const { action = 'status' } = event || {}
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const appid = wxContext.APPID
    const unionid = wxContext.UNIONID || ''

    const db = cloud.database()
    const _ = db.command

    await ensureCollections(db)
    const user = await getOrCreateUser(db, openid, appid, unionid)

    const todayStr = getChinaDateStr()
    const yesterdayStr = getChinaDateStr(Date.now() - 24 * 60 * 60 * 1000)

    if (action === 'ledger') {
      const offset = Number(event?.offset || 0)
      const pageSize = Math.min(50, Math.max(1, Number(event?.pageSize || 20)))
      const list = await getLedger(db, openid, offset, pageSize)
      return {
        code: 0,
        message: 'ok',
        data: {
          list,
          offset,
          pageSize
        }
      }
    }

    if (action === 'do') {
      const recordId = `${openid}_${todayStr}`
      const now = Date.now()

      try {
        await db.collection('checkin_records').add({
          data: {
            _id: recordId,
            openid,
            dateStr: todayStr,
            createdAt: now
          }
        })
      } catch (e) {
        if (isCollectionNotExistError(e)) {
          await ensureCollections(db)
          await db.collection('checkin_records').add({
            data: {
              _id: recordId,
              openid,
              dateStr: todayStr,
              createdAt: now
            }
          })
        } else {
        const list = await getLedger(db, openid, 0, 20)
        return {
          code: 1,
          message: '今日已签到',
          data: {
            checkedInToday: true,
            todayStr,
            streak: user.checkinStreak || 0,
            balance: user.vitalityBalance || 0,
            reward: 0,
            ledger: list
          }
        }
        }
      }

      const prevDate = user.lastCheckinDate || ''
      const prevStreak = Number(user.checkinStreak || 0)
      const newStreak = prevDate === yesterdayStr ? prevStreak + 1 : 1
      const reward = 5

      await db.collection('users').doc(user._id).update({
        data: {
          updateTime: now,
          vitalityBalance: _.inc(reward),
          totalCheckin: _.inc(1),
          checkinStreak: newStreak,
          lastCheckinDate: todayStr
        }
      })

      await db.collection('vitality_ledger').add({
        data: {
          openid,
          type: 'checkin',
          amount: reward,
          dateStr: todayStr,
          createdAt: now,
          streakAfter: newStreak
        }
      })

      const updatedUser = (await db.collection('users').doc(user._id).get()).data
      const list = await getLedger(db, openid, 0, 20)
      return {
        code: 0,
        message: '签到成功',
        data: {
          checkedInToday: true,
          todayStr,
          streak: updatedUser.checkinStreak || newStreak,
          balance: updatedUser.vitalityBalance || reward,
          reward,
          ledger: list
        }
      }
    }

    const checkedInToday = (user.lastCheckinDate || '') === todayStr
    const list = await getLedger(db, openid, 0, 20)

    return {
      code: 0,
      message: 'ok',
      data: {
        checkedInToday,
        todayStr,
        streak: user.checkinStreak || 0,
        balance: user.vitalityBalance || 0,
        ledger: list
      }
    }
  } catch (error) {
    console.error('checkin failed:', error)
    return {
      code: -1,
      message: error.message || 'checkin failed',
      data: null
    }
  }
}
