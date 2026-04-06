type ChallengeCard = {
  id: string
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
}

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    navBarTotalHeight: 64,
    menuButtonTop: 26,
    menuButtonHeight: 32,
    navTitleTop: 26,
    todaySteps: 23434,
    stepMarks: [
      { step: '1000步', reached: true },
      { step: '3000步', reached: true },
      { step: '5000步', reached: true },
      { step: '10000步', reached: true }
    ],
    cards: [
      {
        id: 'tomorrow',
        title: '明天',
        dateText: '(2022年9月20日)',
        statusText: '抢先中',
        statusType: 'pending',
        hint: '倒计时 12 : 23 : 56',
        leftValue: '10000',
        leftLabel: '奖金活力值',
        rightValue: '3456',
        rightLabel: '参与人数',
        actionText: '立即报名'
      },
      {
        id: 'today',
        title: '今天',
        dateText: '(2022年9月20日)',
        statusText: '进行中',
        statusType: 'active',
        leftValue: '433664',
        leftLabel: '总人数',
        rightValue: '3456',
        rightLabel: '参与人数',
        extraLeft: '+5.9',
        extraCenter: '3456',
        extraRight: '10000',
        actionText: '您未报名此次活动'
      },
      {
        id: 'yesterday',
        title: '昨天',
        dateText: '(2022年9月20日)',
        statusText: '已结束',
        statusType: 'done',
        leftValue: '10000',
        leftLabel: '奖金活力值',
        rightValue: '3456',
        rightLabel: '参与人数',
        actionText: '您未排名此次活动'
      }
    ] as ChallengeCard[]
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
  },

  handleBack() {
    wx.navigateBack()
  },

  handleActionTap(e: WechatMiniprogram.BaseEvent) {
    const { id } = e.currentTarget.dataset as { id: string }
    if (id === 'tomorrow') {
      wx.showToast({
        title: '报名功能开发中',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '活动详情开发中',
      icon: 'none'
    })
  }
})
