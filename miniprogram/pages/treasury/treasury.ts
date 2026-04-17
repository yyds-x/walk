import { getUserInfo } from '../../utils/login'

type PromotionItem = {
  id: string
  title: string
  earn: string
  promoted: string
  image: string
}

Page({
  data: {
    statusBarHeight: 0,
    avatarUrl: '/images/my/head.svg',
    todayIncome: '6949.0',
    totalIncome: '10000.0',
    teamCount: '446',
    orderCount: '69',
    promotions: [
      {
        id: 'p1',
        title: '鹿角巷30元红包，承包你一星期的奶茶奶茶奶茶…',
        earn: '2',
        promoted: '3483',
        image: '/images/my/duihuanjuan.svg'
      },
      {
        id: 'p2',
        title: '燃烧我的卡路里系列-去赘肉神器健身滑轮身滑轮',
        earn: '2',
        promoted: '3483',
        image: '/images/my/haodiantuijian.svg'
      },
      {
        id: 'p3',
        title: '鹿角巷30元红包，承包你一星期的奶茶奶茶奶茶…',
        earn: '2',
        promoted: '3483',
        image: '/images/my/lingjuanzhongxing.svg'
      },
      {
        id: 'p4',
        title: '鹿角巷30元红包，承包你一星期的奶茶奶茶奶茶…',
        earn: '2',
        promoted: '3483',
        image: '/images/my/jifenduihuan.svg'
      }
    ] as PromotionItem[]
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const userInfo = getUserInfo()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0,
      avatarUrl: userInfo?.avatarUrl || '/images/my/head.svg'
    })
  },

  onShow() {
    const userInfo = getUserInfo()
    if (userInfo?.avatarUrl) {
      this.setData({ avatarUrl: userInfo.avatarUrl })
    }
  },

  handleBack() {
    wx.navigateBack()
  },

  handleActivityInfo() {
    wx.showModal({
      title: '活动说明',
      content: '本页面展示推广活动的收益与奖励示例，实际收益以活动规则与订单结算为准。',
      showCancel: false
    })
  },

  handlePromoTap() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
})

