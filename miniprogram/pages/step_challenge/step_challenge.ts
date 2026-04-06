import { getUserInfo, isLoggedIn, wxLogin } from '../../utils/login'

type CloudCard = {
  id: string
  dateStr: string
  dateText: string
  dayText: string
  status: 'signup' | 'ongoing' | 'ended'
  statusText: string
  targetSteps: number
  feeVitality: number
  poolVitality: number
  participants: number
  qualified: number
  estimatedEarning: string
  joined: boolean
  endAt: number
  mySteps?: number
  myRank?: number | null
  myQualified?: boolean
  rewardClaimed?: boolean
  rewardAmount?: number
  canClaimReward?: boolean
  leaderboard?: Array<{
    rank: number
    totalSteps: number
    qualified: boolean
    isMe: boolean
  }>
}

type HistoryItem = {
  id: string
  dateStr: string
  targetSteps: number
  poolVitality: number
  participants: number
  qualified?: number
  rewardAmount?: number
}

type ChallengeDetail = {
  id: string
  dateStr: string
  targetSteps: number
  status: string
  poolVitality: number
  participants: number
  qualified: number
  rewardAmount: number
  joined: boolean
  mySteps: number
  myRank: number | null
  myQualified: boolean
  rewardClaimed: boolean
  leaderboard: Array<{
    rank: number
    totalSteps: number
    qualified: boolean
    isMe: boolean
  }>
}

type WeRunOpenData = {
  cloudID?: string
}

type StepMark = {
  step: string
  value: number
  reached: boolean
  active: boolean
}

type ChallengeCard = {
  id: 'tomorrow' | 'today' | 'yesterday'
  activityId: string
  title: string
  dateText: string
  statusText: string
  statusType: 'pending' | 'active' | 'done'
  hint?: string
  leftValue: string
  leftLabel: string
  rightValue: string
  rightLabel: string
  extraLeft?: string
  extraCenter?: string
  extraRight?: string
  actionText?: string
  buttonText?: string
  buttonAction?: 'join' | 'claimReward'
  joined?: boolean
  feeVitality?: number
  targetSteps?: number
  canClaimReward?: boolean
  rewardAmount?: number
  leaderboard?: Array<{
    rank: number
    totalSteps: string
    qualifiedText: string
    isMe: boolean
  }>
}

const TARGET_STEPS = [1000, 3000, 5000, 10000]

function formatDateText(dateStr: string) {
  if (!dateStr) return ''
  const [year = '', month = '', day = ''] = dateStr.split('-')
  return `(${year}年${month}月${day}日)`
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '0'
  return String(Math.trunc(value))
}

function formatDecimal(value: number) {
  if (!Number.isFinite(value)) return '0.0'
  return value.toFixed(1)
}

function formatCountdown(endAt: number) {
  const diff = Math.max(0, endAt - Date.now())
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((diff % (60 * 1000)) / 1000)
  return [hours, minutes, seconds].map((item) => String(item).padStart(2, '0')).join(' : ')
}

function buildStepMarks(todaySteps: number, selectedTargetSteps: number): StepMark[] {
  return TARGET_STEPS.map((value) => ({
    step: `${value}步`,
    value,
    reached: todaySteps >= value,
    active: value === selectedTargetSteps
  }))
}

function mapCardId(status: CloudCard['status']): ChallengeCard['id'] {
  if (status === 'signup') return 'tomorrow'
  if (status === 'ongoing') return 'today'
  return 'yesterday'
}

function mapStatusType(status: CloudCard['status']): ChallengeCard['statusType'] {
  if (status === 'signup') return 'pending'
  if (status === 'ongoing') return 'active'
  return 'done'
}

function buildHint(card: CloudCard) {
  if (card.status === 'signup') {
    if (card.endAt > Date.now()) {
      return `倒计时 ${formatCountdown(card.endAt)}`
    }
    return `报名消耗 ${card.feeVitality} 活力值`
  }
  if (card.status === 'ongoing') {
    return `挑战目标 ${card.targetSteps} 步`
  }
  return `挑战目标 ${card.targetSteps} 步`
}

function mapCard(card: CloudCard): ChallengeCard {
  const base: ChallengeCard = {
    id: mapCardId(card.status),
    activityId: card.id,
    title: card.dayText,
    dateText: formatDateText(card.dateText || card.dateStr),
    statusText: card.statusText,
    statusType: mapStatusType(card.status),
    hint: buildHint(card),
    leftValue: formatNumber(card.poolVitality),
    leftLabel: '奖金活力值',
    rightValue: formatNumber(card.participants),
    rightLabel: '参与人数',
    feeVitality: card.feeVitality,
    targetSteps: card.targetSteps,
    joined: card.joined
  }

  if (card.status === 'signup') {
    return {
      ...base,
      actionText: card.joined ? '已报名本场挑战' : `报名消耗 ${card.feeVitality} 活力值`,
      buttonText: card.joined ? '已报名' : '立即报名',
      buttonAction: 'join',
      leaderboard: (card.leaderboard || []).map((item) => ({
        rank: item.rank,
        totalSteps: formatNumber(item.totalSteps),
        qualifiedText: item.qualified ? '已达标' : '未达标',
        isMe: item.isMe
      }))
    }
  }

  if (card.status === 'ongoing') {
    const rankText = card.myRank ? `，排名第 ${card.myRank} 名` : ''
    return {
      ...base,
      leftValue: formatNumber(card.qualified),
      leftLabel: '达标人数',
      extraLeft: `+${formatDecimal(Number(card.estimatedEarning || 0))}`,
      extraCenter: formatNumber(card.participants),
      extraRight: formatNumber(card.poolVitality),
      actionText: card.joined ? `已报名 ${card.targetSteps} 步挑战，当前 ${formatNumber(Number(card.mySteps || 0))} 步${rankText}` : '您未报名此次活动',
      leaderboard: (card.leaderboard || []).map((item) => ({
        rank: item.rank,
        totalSteps: formatNumber(item.totalSteps),
        qualifiedText: item.qualified ? '已达标' : '冲刺中',
        isMe: item.isMe
      }))
    }
  }

  return {
    ...base,
    actionText: card.canClaimReward
      ? `已达标${card.myRank ? `，排名第 ${card.myRank} 名` : ''}，可领取 ${formatNumber(Number(card.rewardAmount || 0))} 活力值`
      : card.rewardClaimed
        ? `奖励已领取${card.myRank ? `，排名第 ${card.myRank} 名` : ''}，共 ${formatNumber(Number(card.rewardAmount || 0))} 活力值`
        : card.joined
          ? `您已参与 ${card.targetSteps} 步挑战${card.myRank ? `，排名第 ${card.myRank} 名` : ''}`
          : '您未报名此次活动',
    buttonText: card.canClaimReward ? '领取奖励' : '',
    buttonAction: card.canClaimReward ? 'claimReward' : undefined,
    canClaimReward: !!card.canClaimReward,
    rewardAmount: Number(card.rewardAmount || 0),
    leaderboard: (card.leaderboard || []).map((item) => ({
      rank: item.rank,
      totalSteps: formatNumber(item.totalSteps),
      qualifiedText: item.qualified ? '已达标' : '未达标',
      isMe: item.isMe
    }))
  }
}

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    navBarTotalHeight: 64,
    menuButtonTop: 26,
    menuButtonHeight: 32,
    navTitleTop: 26,
    todaySteps: 0,
    selectedTargetSteps: 1000,
    stepMarks: buildStepMarks(0, 1000),
    cards: [] as ChallengeCard[],
    history: [] as Array<{ id: string; title: string; sub: string; meta: string }>,
    detailVisible: false,
    detailLoading: false,
    detailData: null as null | {
      title: string
      summary: string
      statusText: string
      rewardText: string
      myText: string
      leaderboard: Array<{ rank: string; steps: string; state: string }>
    },
    isLoading: false,
    isSyncingSteps: false
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height
    this.setData({
      statusBarHeight: statusBarHeight || 20,
      navBarHeight: navBarHeight || 44,
      navBarTotalHeight: (statusBarHeight || 20) + (navBarHeight || 44),
      menuButtonTop: menuButtonInfo.top || 26,
      menuButtonHeight: menuButtonInfo.height || 32,
      navTitleTop: menuButtonInfo.top || 26
    })

    this.bootstrap()
  },

  onShow() {
    if (isLoggedIn()) {
      this.loadChallengePage(this.data.selectedTargetSteps)
    }
  },

  bootstrap() {
    if (isLoggedIn()) {
      this.loadChallengePage(this.data.selectedTargetSteps)
      return
    }

    this.setData({ isLoading: true })
    wxLogin(() => {
      this.setData({ isLoading: false })
      this.loadChallengePage(this.data.selectedTargetSteps)
    })
  },

  loadChallengePage(targetSteps: number) {
    if (this.data.isLoading) return

    this.setData({ isLoading: true })
    wx.cloud.callFunction({
      name: 'stepChallenge',
      data: {
        action: 'page',
        targetSteps
      },
      success: (res) => {
        const result = (res as any).result || {}
        if (result.code !== 0) {
          wx.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          })
          return
        }

        const data = result.data || {}
        const todaySteps = Number(data.todaySteps || 0)
        const cloudCards = Array.isArray(data.cards) ? (data.cards as CloudCard[]) : []
        const cards = cloudCards.map(mapCard)
        const history = Array.isArray(data.history)
          ? (data.history as HistoryItem[]).map((item) => ({
              id: item.id,
              title: `${item.targetSteps} 步挑战`,
              sub: formatDateText(item.dateStr),
              meta: `奖池 ${formatNumber(item.poolVitality)} 活力值 · ${formatNumber(item.participants)} 人参与 · ${formatNumber(Number(item.qualified || 0))} 人达标`
            }))
          : []

        this.setData({
          todaySteps,
          selectedTargetSteps: targetSteps,
          stepMarks: buildStepMarks(todaySteps, targetSteps),
          cards,
          history
        })
        this.syncWeRunData(true)
      },
      fail: () => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },

  handleBack() {
    wx.navigateBack()
  },

  handleSyncTap() {
    this.syncWeRunData(false)
  },

  noop() {},

  handleStepMarkTap(e: WechatMiniprogram.BaseEvent) {
    const targetSteps = Number((e.currentTarget.dataset as { step?: number }).step || 0)
    if (!targetSteps || targetSteps === this.data.selectedTargetSteps) return
    this.loadChallengePage(targetSteps)
  },

  handleCardTap(e: WechatMiniprogram.BaseEvent) {
    const { activityId, statusType } = e.currentTarget.dataset as { activityId?: string; statusType?: string }
    if (!activityId || statusType !== 'done') return
    this.openDetail(activityId)
  },

  handleHistoryTap(e: WechatMiniprogram.BaseEvent) {
    const { activityId } = e.currentTarget.dataset as { activityId?: string }
    if (!activityId) return
    this.openDetail(activityId)
  },

  closeDetail() {
    this.setData({ detailVisible: false })
  },

  handleActionTap(e: WechatMiniprogram.BaseEvent) {
    const { activityId, action } = e.currentTarget.dataset as { activityId?: string; action?: 'join' | 'claimReward' }
    const targetSteps = this.data.selectedTargetSteps
    const targetCard = this.data.cards.find((item) => item.activityId === activityId)

    if (!activityId || !targetCard || !action) {
      wx.showToast({
        title: '活动不存在',
        icon: 'none'
      })
      return
    }

    if (action === 'join' && targetCard.joined) {
      wx.showToast({
        title: '您已报名本场挑战',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: action === 'claimReward' ? '领取中...' : '报名中...' })
    wx.cloud.callFunction({
      name: 'stepChallenge',
      data: {
        action,
        activityId,
        targetSteps
      },
      success: (res) => {
        const result = (res as any).result || {}
        if (result.code !== 0) {
          wx.showToast({
            title: result.message || (action === 'claimReward' ? '领取失败' : '报名失败'),
            icon: 'none'
          })
          return
        }

        const userInfo = getUserInfo() || {}
        const nextBalance = action === 'claimReward'
          ? Number(userInfo.vitalityBalance || 0) + Number(result.data?.rewardAmount || targetCard.rewardAmount || 0)
          : Math.max(0, Number(userInfo.vitalityBalance || 0) - Number(targetCard.feeVitality || 0))
        wx.setStorageSync('userInfo', {
          ...userInfo,
          vitalityBalance: nextBalance
        })

        wx.showToast({
          title: action === 'claimReward' ? '领取成功' : '报名成功',
          icon: 'success'
        })
        this.loadChallengePage(targetSteps)
      },
      fail: () => {
        wx.showToast({
          title: action === 'claimReward' ? '领取失败' : '报名失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  openDetail(activityId: string) {
    this.setData({
      detailVisible: true,
      detailLoading: true,
      detailData: null
    })

    wx.cloud.callFunction({
      name: 'stepChallenge',
      data: {
        action: 'detail',
        activityId
      },
      success: (res) => {
        const result = (res as any).result || {}
        if (result.code !== 0) {
          wx.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          })
          this.setData({ detailVisible: false })
          return
        }

        const data = (result.data || {}) as ChallengeDetail
        this.setData({
          detailData: {
            title: `${formatDateText(data.dateStr)} ${formatNumber(data.targetSteps)}步挑战`,
            summary: `奖池 ${formatNumber(data.poolVitality)} 活力值，${formatNumber(data.participants)} 人参与，${formatNumber(data.qualified)} 人达标`,
            statusText: data.rewardClaimed
              ? `奖励已领取 ${formatNumber(data.rewardAmount)} 活力值`
              : data.myQualified
                ? `您已达标，可得 ${formatNumber(data.rewardAmount)} 活力值`
                : data.joined
                  ? '您已参与但未达标'
                  : '您未参与本场挑战',
            rewardText: `人均奖励 ${formatNumber(data.rewardAmount)} 活力值`,
            myText: data.joined
              ? `我的步数 ${formatNumber(data.mySteps)} 步${data.myRank ? ` · 排名第 ${data.myRank} 名` : ''}`
              : '暂无个人成绩',
            leaderboard: (data.leaderboard || []).map((item) => ({
              rank: `TOP ${item.rank}`,
              steps: `${formatNumber(item.totalSteps)} 步`,
              state: item.qualified ? '已达标' : '未达标'
            }))
          }
        })
      },
      fail: () => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
        this.setData({ detailVisible: false })
      },
      complete: () => {
        this.setData({ detailLoading: false })
      }
    })
  },

  syncWeRunData(silent: boolean) {
    if (this.data.isSyncingSteps) return

    wx.getWeRunData({
      success: (res) => {
        const cloudID = (res as WechatMiniprogram.GetWeRunDataSuccessCallbackResult & WeRunOpenData).cloudID
        if (!cloudID) {
          if (!silent) {
            wx.showToast({
              title: '当前无法获取微信步数',
              icon: 'none'
            })
          }
          return
        }

        this.setData({ isSyncingSteps: true })
        wx.cloud.callFunction({
          name: 'stepChallenge',
          data: {
            action: 'sync',
            weRunData: wx.cloud.CloudID(cloudID)
          },
          success: (callRes) => {
            const result = (callRes as any).result || {}
            if (result.code !== 0) {
              if (!silent) {
                wx.showToast({
                  title: result.message || '同步失败',
                  icon: 'none'
                })
              }
              return
            }

            const data = result.data || {}
            const todaySteps = Number(data.todaySteps || 0)
            const targetSteps = Number(this.data.selectedTargetSteps || TARGET_STEPS[0])
            const cloudCards = Array.isArray(data.cards) ? (data.cards as CloudCard[]) : []
            const history = Array.isArray(data.history)
              ? (data.history as HistoryItem[]).map((item) => ({
                  id: item.id,
                  title: `${item.targetSteps} 步挑战`,
                  sub: formatDateText(item.dateStr),
                  meta: `奖池 ${formatNumber(item.poolVitality)} 活力值 · ${formatNumber(item.participants)} 人参与 · ${formatNumber(Number(item.qualified || 0))} 人达标`
                }))
              : []
            this.setData({
              todaySteps,
              stepMarks: buildStepMarks(todaySteps, targetSteps),
              cards: cloudCards.map(mapCard),
              history
            })

            if (!silent) {
              wx.showToast({
                title: '步数已同步',
                icon: 'success'
              })
            }
          },
          fail: () => {
            if (!silent) {
              wx.showToast({
                title: '同步失败',
                icon: 'none'
              })
            }
          },
          complete: () => {
            this.setData({ isSyncingSteps: false })
          }
        })
      },
      fail: () => {
        if (silent) return
        wx.showModal({
          title: '需要微信运动授权',
          content: '开启微信运动权限后，才可以同步真实步数。',
          confirmText: '去设置',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  }
})
