const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const TARGET_STEPS = [1000, 3000, 5000, 10000]

function getChinaDateStr(ts = Date.now()) {
  const chinaTs = ts + 8 * 60 * 60 * 1000
  return new Date(chinaTs).toISOString().slice(0, 10)
}

function isCollectionNotExistError(error) {
  const message = String(error?.errMsg || error?.message || '')
  return message.includes('DATABASE_COLLECTION_NOT_EXIST') || message.includes('collection not exists') || message.includes('-502005')
}

async function ensureCollections(db) {
  const names = ['step_challenges', 'step_challenge_participants', 'step_challenge_reward_claims', 'vitality_ledger', 'users', 'steps_daily_steps']
  for (const name of names) {
    try {
      await db.createCollection(name)
    } catch (error) {}
  }
}

async function getOrCreateUser(db, openid, appid, unionid) {
  const res = await db.collection('users').where({ openid }).get()
  if (res.data.length > 0) return res.data[0]

  const now = Date.now()
  const user = {
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
  const addResult = await db.collection('users').add({ data: user })
  return { ...user, _id: addResult._id }
}

async function getLatestTodaySteps(db, openid) {
  try {
    const res = await db
      .collection('steps_daily_steps')
      .where({ openid })
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get()

    if (!res.data.length) return 0
    return Number(res.data[0].steps || 0)
  } catch (error) {
    if (isCollectionNotExistError(error)) {
      await ensureCollections(db)
      return 0
    }
    throw error
  }
}

function parseStepInfoList(weRunData) {
  if (!weRunData) return []
  if (Array.isArray(weRunData.stepInfoList)) return weRunData.stepInfoList
  if (weRunData.data && Array.isArray(weRunData.data.stepInfoList)) return weRunData.data.stepInfoList
  return []
}

function pickTodaySteps(stepInfoList) {
  const todayStr = getChinaDateStr()
  const matched = stepInfoList.find((item) => getChinaDateStr(Number(item.timestamp || 0) * 1000) === todayStr)
  return Number((matched && matched.step) || 0)
}

async function listActivitiesByTarget(db, targetSteps) {
  const res = await db
    .collection('step_challenges')
    .where({ targetSteps })
    .orderBy('dateStr', 'desc')
    .get()

  return res.data || []
}

function statusText(status) {
  if (status === 'signup') return '抢先中'
  if (status === 'ongoing') return '进行中'
  return '已结束'
}

function dayText(status) {
  if (status === 'signup') return '明天'
  if (status === 'ongoing') return '今天'
  return '昨天'
}

function pickLatestByStatus(list, status) {
  return list.find((item) => String(item.status || '') === status) || null
}

async function getJoinedMap(db, openid, activityIds) {
  const joinedMap = new Map()
  for (const activityId of activityIds) {
    const docId = `${activityId}_${openid}`
    try {
      await db.collection('step_challenge_participants').doc(docId).get()
      joinedMap.set(activityId, true)
    } catch (error) {
      joinedMap.set(activityId, false)
    }
  }
  return joinedMap
}

async function getRewardClaimMap(db, openid, activityIds) {
  const claimedMap = new Map()
  for (const activityId of activityIds) {
    const docId = `${activityId}_${openid}`
    try {
      await db.collection('step_challenge_reward_claims').doc(docId).get()
      claimedMap.set(activityId, true)
    } catch (error) {
      claimedMap.set(activityId, false)
    }
  }
  return claimedMap
}

async function getActivityStats(db, activityId) {
  const [participantsRes, qualifiedRes, leaderboardRes] = await Promise.all([
    db.collection('step_challenge_participants').where({ activityId }).count(),
    db.collection('step_challenge_participants').where({ activityId, qualified: true }).count(),
    db
      .collection('step_challenge_participants')
      .where({ activityId })
      .orderBy('totalSteps', 'desc')
      .orderBy('createdAt', 'asc')
      .limit(3)
      .get()
  ])

  return {
    participants: Number(participantsRes.total || 0),
    qualified: Number(qualifiedRes.total || 0),
    leaderboard: (leaderboardRes.data || []).map((item, index) => ({
      rank: index + 1,
      totalSteps: Number(item.totalSteps || 0),
      qualified: !!item.qualified,
      isMe: false
    }))
  }
}

async function buildHistoryList(db, activities, targetSteps) {
  const endedActivities = activities
    .filter((item) => String(item.status || '') === 'ended')
    .slice(1, 10)

  const history = await Promise.all(endedActivities.map(async (item) => {
    const stats = await getActivityStats(db, item._id)
    const rewardAmount = stats.qualified > 0 ? Math.floor(Number(item.poolVitality || 0) / stats.qualified) : 0

    return {
      id: item._id,
      dateStr: String(item.dateStr || ''),
      targetSteps: Number(item.targetSteps || targetSteps),
      poolVitality: Number(item.poolVitality || 0),
      participants: stats.participants,
      qualified: stats.qualified,
      rewardAmount
    }
  }))

  return history
}

async function getMyParticipant(db, openid, activityId) {
  const docId = `${activityId}_${openid}`
  try {
    const res = await db.collection('step_challenge_participants').doc(docId).get()
    return res.data || null
  } catch (error) {
    return null
  }
}

async function getMyRank(db, activityId, openid, mySteps) {
  if (!mySteps || mySteps <= 0) return null

  const res = await db
    .collection('step_challenge_participants')
    .where({ activityId })
    .orderBy('totalSteps', 'desc')
    .orderBy('createdAt', 'asc')
    .get()

  const list = res.data || []
  const index = list.findIndex((item) => String(item.openid || '') === openid)
  return index >= 0 ? index + 1 : null
}

async function syncSteps(db, openid, weRunData) {
  const stepInfoList = parseStepInfoList(weRunData)
  if (!stepInfoList.length) {
    throw new Error('未获取到微信运动数据')
  }

  const todayStr = getChinaDateStr()
  const todaySteps = pickTodaySteps(stepInfoList)
  const now = Date.now()

  await db.collection('steps_daily_steps').add({
    data: {
      _id: `day_${todayStr}_${openid}`,
      openid,
      dateStr: todayStr,
      steps: todaySteps,
      updatedAt: now
    }
  }).catch(async () => {
    await db.collection('steps_daily_steps').doc(`day_${todayStr}_${openid}`).set({
      data: {
        openid,
        dateStr: todayStr,
        steps: todaySteps,
        updatedAt: now
      }
    })
  })

  const joinedRes = await db.collection('step_challenge_participants').where({ openid, dateStr: todayStr }).get()
  const joinedList = joinedRes.data || []
  for (const joined of joinedList) {
    await db.collection('step_challenge_participants').doc(joined._id).update({
      data: {
        totalSteps: todaySteps,
        qualified: todaySteps >= Number(joined.targetSteps || 0),
        qualifiedAt: todaySteps >= Number(joined.targetSteps || 0) ? now : null,
        updatedAt: now
      }
    }).catch(() => {})
  }

  return todaySteps
}

async function buildPageData(db, openid, targetSteps) {
  const activities = await listActivitiesByTarget(db, targetSteps)
  const selected = ['signup', 'ongoing', 'ended']
    .map((status) => pickLatestByStatus(activities, status))
    .filter(Boolean)

  const activityIds = selected.map((item) => item._id)
  const joinedMap = await getJoinedMap(db, openid, activityIds)
  const rewardClaimMap = await getRewardClaimMap(db, openid, activityIds)
  const todaySteps = await getLatestTodaySteps(db, openid)

  const cards = []
  for (const activity of selected) {
    const stats = await getActivityStats(db, activity._id)
    const myParticipant = await getMyParticipant(db, openid, activity._id)
    const myRank = await getMyRank(db, activity._id, openid, Number(myParticipant?.totalSteps || 0))
    const joined = !!joinedMap.get(activity._id)
    const rewardClaimed = !!rewardClaimMap.get(activity._id)
    const qualified = !!myParticipant?.qualified
    const rewardPerUser = stats.qualified > 0 ? Math.floor(Number(activity.poolVitality || 0) / stats.qualified) : 0

    cards.push({
      id: activity._id,
      dateStr: String(activity.dateStr || ''),
      dateText: String(activity.dateStr || ''),
      dayText: dayText(String(activity.status || 'ended')),
      status: String(activity.status || 'ended'),
      statusText: statusText(String(activity.status || 'ended')),
      targetSteps: Number(activity.targetSteps || targetSteps),
      feeVitality: Number(activity.feeVitality || 0),
      poolVitality: Number(activity.poolVitality || 0),
      participants: stats.participants,
      qualified: stats.qualified,
      estimatedEarning: String(activity.estimatedEarning || '0.0'),
      joined,
      endAt: Number(activity.endAt || 0),
      mySteps: Number(myParticipant?.totalSteps || 0),
      myRank,
      myQualified: qualified,
      rewardClaimed,
      rewardAmount: rewardPerUser,
      canClaimReward: String(activity.status || '') === 'ended' && joined && qualified && !rewardClaimed,
      leaderboard: stats.leaderboard.map((item) => ({
        ...item,
        isMe: item.rank > 0 && Number(myParticipant?.totalSteps || -1) === item.totalSteps && !!joined
      }))
    })
  }

  return {
    todaySteps,
    targetSteps,
    cards,
    history: await buildHistoryList(db, activities, targetSteps)
  }
}

async function getChallengeDetail(db, openid, activityId) {
  const activityRes = await db.collection('step_challenges').doc(activityId).get()
  const activity = activityRes.data
  if (!activity) {
    throw new Error('活动不存在')
  }

  const stats = await getActivityStats(db, activityId)
  const myParticipant = await getMyParticipant(db, openid, activityId)
  const myRank = await getMyRank(db, activityId, openid, Number(myParticipant?.totalSteps || 0))
  const rewardClaimed = await db.collection('step_challenge_reward_claims').doc(`${activityId}_${openid}`).get().then(() => true).catch(() => false)
  const rewardAmount = stats.qualified > 0 ? Math.floor(Number(activity.poolVitality || 0) / stats.qualified) : 0

  return {
    id: activityId,
    dateStr: String(activity.dateStr || ''),
    targetSteps: Number(activity.targetSteps || 0),
    status: String(activity.status || ''),
    poolVitality: Number(activity.poolVitality || 0),
    participants: stats.participants,
    qualified: stats.qualified,
    rewardAmount,
    joined: !!myParticipant,
    mySteps: Number(myParticipant?.totalSteps || 0),
    myRank,
    myQualified: !!myParticipant?.qualified,
    rewardClaimed,
    leaderboard: stats.leaderboard
  }
}

exports.main = async (event) => {
  try {
    const { action = 'page' } = event || {}
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const appid = wxContext.APPID
    const unionid = wxContext.UNIONID || ''
    const targetSteps = TARGET_STEPS.includes(Number(event?.targetSteps)) ? Number(event.targetSteps) : TARGET_STEPS[0]

    const db = cloud.database()
    const _ = db.command

    await ensureCollections(db)
    const user = await getOrCreateUser(db, openid, appid, unionid)

    if (action === 'claimReward') {
      const activityId = String(event?.activityId || '')
      if (!activityId) {
        return { code: 1, message: '活动不存在', data: null }
      }

      const activityRes = await db.collection('step_challenges').doc(activityId).get()
      const activity = activityRes.data
      if (!activity || String(activity.status || '') !== 'ended') {
        return { code: 1, message: '奖励暂不可领取', data: null }
      }

      const participant = await getMyParticipant(db, openid, activityId)
      if (!participant || !participant.qualified) {
        return { code: 1, message: '未达标，无法领取', data: null }
      }

      const claimId = `${activityId}_${openid}`
      try {
        await db.collection('step_challenge_reward_claims').doc(claimId).get()
        return { code: 1, message: '奖励已领取', data: null }
      } catch (error) {}

      const stats = await getActivityStats(db, activityId)
      const rewardAmount = stats.qualified > 0 ? Math.floor(Number(activity.poolVitality || 0) / stats.qualified) : 0
      const now = Date.now()

      await db.collection('step_challenge_reward_claims').add({
        data: {
          _id: claimId,
          activityId,
          openid,
          amount: rewardAmount,
          createdAt: now
        }
      })

      await db.collection('users').doc(user._id).update({
        data: {
          updateTime: now,
          vitalityBalance: _.inc(rewardAmount)
        }
      })

      await db.collection('vitality_ledger').add({
        data: {
          openid,
          type: 'step_challenge_reward',
          amount: rewardAmount,
          dateStr: getChinaDateStr(),
          createdAt: now,
          activityId
        }
      })

      const data = await buildPageData(db, openid, targetSteps)
      return {
        code: 0,
        message: 'ok',
        data: {
          ...data,
          rewardAmount
        }
      }
    }

    if (action === 'detail') {
      const activityId = String(event?.activityId || '')
      if (!activityId) {
        return { code: 1, message: '活动不存在', data: null }
      }

      const data = await getChallengeDetail(db, openid, activityId)
      return {
        code: 0,
        message: 'ok',
        data
      }
    }

    if (action === 'sync') {
      const todaySteps = await syncSteps(db, openid, event?.weRunData)
      const data = await buildPageData(db, openid, targetSteps)
      return {
        code: 0,
        message: 'ok',
        data: {
          ...data,
          todaySteps
        }
      }
    }

    if (action === 'join') {
      const activityId = String(event?.activityId || '')
      if (!activityId) {
        return { code: 1, message: '活动不存在', data: null }
      }

      const activityRes = await db.collection('step_challenges').doc(activityId).get()
      const activity = activityRes.data
      if (!activity) {
        return { code: 1, message: '活动不存在', data: null }
      }
      if (String(activity.status || '') !== 'signup') {
        return { code: 1, message: '当前不可报名', data: null }
      }

      const docId = `${activityId}_${openid}`
      try {
        await db.collection('step_challenge_participants').doc(docId).get()
        return { code: 1, message: '已报名', data: null }
      } catch (error) {}

      const feeVitality = Number(activity.feeVitality || 0)
      const balance = Number(user.vitalityBalance || 0)
      if (balance < feeVitality) {
        return { code: 1, message: '活力值不足', data: null }
      }

      const now = Date.now()
      const todayStr = getChinaDateStr()

      await db.collection('step_challenge_participants').add({
        data: {
          _id: docId,
          activityId,
          openid,
          targetSteps: Number(activity.targetSteps || targetSteps),
          feeVitality,
          createdAt: now,
          dateStr: String(activity.dateStr || '')
        }
      })

      await db.collection('users').doc(user._id).update({
        data: {
          updateTime: now,
          vitalityBalance: _.inc(-feeVitality)
        }
      })

      await db.collection('vitality_ledger').add({
        data: {
          openid,
          type: 'step_challenge_join',
          amount: -feeVitality,
          dateStr: todayStr,
          createdAt: now,
          activityId
        }
      })

      await db.collection('step_challenges').doc(activityId).update({
        data: {
          participants: _.inc(1),
          poolVitality: _.inc(feeVitality),
          updatedAt: now
        }
      })

      const pageData = await buildPageData(db, openid, Number(activity.targetSteps || targetSteps))
      return {
        code: 0,
        message: 'ok',
        data: {
          ...pageData,
          balance: balance - feeVitality
        }
      }
    }

    const data = await buildPageData(db, openid, targetSteps)
    return {
      code: 0,
      message: 'ok',
      data
    }
  } catch (error) {
    console.error('stepChallenge failed:', error)
    return {
      code: -1,
      message: error.message || 'stepChallenge failed',
      data: null
    }
  }
}
