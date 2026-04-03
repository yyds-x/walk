import { wxLogin, isLoggedIn, getUserInfo } from '../../utils/login'

type CheckinStatus = {
  checkedInToday: boolean
  todayStr: string
  streak: number
  balance: number
}

const CYCLE_DAYS = 8

function signedCountInCycle(streak: number) {
  if (streak <= 0) return 0
  const m = streak % CYCLE_DAYS
  return m === 0 ? CYCLE_DAYS : m
}

function nextGiftDays(streak: number) {
  const m = streak % CYCLE_DAYS
  const left = CYCLE_DAYS - m
  return left === 0 ? CYCLE_DAYS : left
}

Page({
  data: {
    statusBarHeight: 0,
    userInfo: {
      avatarUrl: ''
    },
    checkedInToday: false,
    todayStr: '',
    streak: 0,
    balance: 0,
    nextGiftDays: CYCLE_DAYS,
    daysTop: [
      { day: 1, reward: 5, state: '' },
      { day: 2, reward: 5, state: '' },
      { day: 3, reward: 5, state: '' },
      { day: 4, reward: 5, state: '' }
    ],
    daysBottom: [
      { day: 5, reward: 5, state: '' },
      { day: 6, reward: 5, state: '' },
      { day: 7, reward: 5, state: '' },
      { day: 8, reward: 5, state: '' }
    ],
    isLoading: false
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: systemInfo.statusBarHeight || 0 })
    this.setData({ userInfo: getUserInfo() || { avatarUrl: '/images/my/head.svg' } })
    if (isLoggedIn()) {
      this.loadStatus()
      return
    }
    this.setData({ isLoading: true })
    wxLogin(() => {
      this.setData({ isLoading: false, userInfo: getUserInfo() || { avatarUrl: '/images/my/head.svg' } })
      this.loadStatus()
    })
  },

  onShow() {
    this.setData({ userInfo: getUserInfo() || { avatarUrl: '/images/my/head.svg' } })
  },

  handleBack() {
    wx.navigateBack()
  },

  handleRulesTap() {
    wx.showModal({
      title: '签到规则',
      content: '每日可签到一次，签到获得活力值奖励。连续签到可领取更多好礼，断签则重新计算连续天数。',
      showCancel: false
    })
  },

  goLedger() {
    wx.navigateTo({ url: '/pages/vitality_detail/vitality_detail' })
  },

  handleTaskTap() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  loadStatus() {
    wx.cloud.callFunction({
      name: 'checkin',
      data: { action: 'status' },
      success: (res) => {
        const result = res.result as any
        if (result?.code !== 0) {
          wx.showToast({ title: result?.message || '加载失败', icon: 'none' })
          return
        }
        const data = result.data as CheckinStatus
        this.applyStatus(data)
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    })
  },

  handleCheckin() {
    if (this.data.checkedInToday) return
    wx.showLoading({ title: '签到中...' })
    wx.cloud.callFunction({
      name: 'checkin',
      data: { action: 'do' },
      success: (res) => {
        const result = res.result as any
        if (result?.code === 0) {
          const data = result.data as CheckinStatus & { reward: number }
          this.applyStatus(data)
          const current = getUserInfo() || {}
          wx.setStorageSync('userInfo', {
            ...current,
            vitalityBalance: data.balance,
            checkinStreak: data.streak,
            lastCheckinDate: data.todayStr
          })
          wx.showToast({ title: `+${data.reward}活力值`, icon: 'success' })
          return
        }
        if (result?.code === 1) {
          const data = result.data as CheckinStatus
          this.applyStatus(data)
          wx.showToast({ title: result?.message || '今日已签到', icon: 'none' })
          return
        }
        wx.showToast({ title: result?.message || '签到失败', icon: 'none' })
      },
      fail: () => {
        wx.showToast({ title: '签到失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  applyStatus(data: CheckinStatus) {
    const streak = Number(data.streak || 0)
    const signed = signedCountInCycle(streak)
    const checkedInToday = !!data.checkedInToday
    const activeDay = checkedInToday ? signed : Math.min(CYCLE_DAYS, signed + 1)
    const days = Array.from({ length: CYCLE_DAYS }, (_, i) => i + 1).map((d) => {
      if (checkedInToday) {
        return { day: d, reward: 5, state: d <= signed ? 'done' : '' }
      }
      const state = d < activeDay ? 'done' : d === activeDay ? 'active' : ''
      return { day: d, reward: 5, state }
    })

    this.setData({
      checkedInToday,
      todayStr: data.todayStr || '',
      streak,
      balance: Number(data.balance || 0),
      nextGiftDays: nextGiftDays(streak),
      daysTop: days.slice(0, 4),
      daysBottom: days.slice(4, 8)
    })
  }
})
