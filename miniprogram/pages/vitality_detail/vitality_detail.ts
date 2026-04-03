import { wxLogin, isLoggedIn } from '../../utils/login'

type LedgerItem = {
  _id?: string
  type?: string
  amount?: number
  dateStr?: string
  createdAt?: number
}

function formatTitle(type?: string) {
  if (type === 'checkin') return '签到奖励'
  if (type === 'steps') return '步数转化'
  if (type === 'redeem') return '兑换商品'
  if (type === 'invite') return '邀请奖励'
  return '活力值变动'
}

function formatNumber(num: number) {
  if (Number.isNaN(num)) return '0'
  if (Math.floor(num) === num) return String(num)
  return num.toFixed(2)
}

function formatMoneyLike(num: number) {
  if (Number.isNaN(num)) return '0.00'
  return num.toFixed(2)
}

Page({
  data: {
    statusBarHeight: 0,
    todayStr: '',
    todayTotal: '0.00',
    balance: '0.00',
    items: [] as Array<{ id: string; title: string; sub: string; amount: number; amountDisplay: string }>,
    offset: 0,
    pageSize: 20,
    hasMore: true,
    isLoading: false
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: systemInfo.statusBarHeight || 0 })
    if (isLoggedIn()) {
      this.loadMore(true)
      return
    }
    this.setData({ isLoading: true })
    wxLogin(() => {
      this.setData({ isLoading: false })
      this.loadMore(true)
    })
  },

  onReachBottom() {
    this.loadMore(false)
  },

  handleBack() {
    wx.navigateBack()
  },

  handleMore() {
    wx.showActionSheet({
      itemList: ['推荐给好友', '返回'],
      success: (res) => {
        if (res.tapIndex === 0) return
        wx.navigateBack()
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '走路赚活力值，一起动起来',
      path: '/pages/checkin/checkin'
    } as any
  },

  loadMore(reset: boolean) {
    if (this.data.isLoading) return
    if (!this.data.hasMore && !reset) return

    if (reset) {
      this.loadInitial()
      return
    }

    const offset = reset ? 0 : this.data.offset
    const pageSize = this.data.pageSize

    this.setData({ isLoading: true })
    wx.cloud.callFunction({
      name: 'checkin',
      data: { action: 'ledger', offset, pageSize },
      success: (res) => {
        const result = (res as any).result || {}
        const code = (result && typeof result === 'object' && 'code' in result) ? (result as any).code : undefined
        const message = (result && typeof result === 'object' && 'message' in result) ? (result as any).message : ''
        if (code !== 0) {
          wx.showToast({ title: message || '加载失败', icon: 'none' })
          return
        }

        const list = (result && typeof result === 'object' && result.data && result.data.list) ? (result.data.list as LedgerItem[]) : []
        const mapped = list.map((it) => ({
          id: it._id || `${it.createdAt || 0}-${Math.random()}`,
          title: formatTitle(it.type),
          sub: it.dateStr || '',
          amount: Number(it.amount || 0),
          amountDisplay: formatNumber(Number(it.amount || 0))
        }))

        const merged = reset ? mapped : [...this.data.items, ...mapped]
        this.setData({
          items: merged,
          offset: offset + list.length,
          hasMore: list.length === pageSize
        })
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  },

  loadInitial() {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })
    wx.cloud.callFunction({
      name: 'checkin',
      data: { action: 'status' },
      success: (res) => {
        const result = (res as any).result || {}
        const code = (result && typeof result === 'object' && 'code' in result) ? (result as any).code : undefined
        const message = (result && typeof result === 'object' && 'message' in result) ? (result as any).message : ''
        if (code !== 0) {
          wx.showToast({ title: message || '加载失败', icon: 'none' })
          return
        }

        const data = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : {}
        const todayStr = String((data && data.todayStr) || '')
        const balance = Number((data && data.balance) || 0)
        const list = ((data && data.ledger) || []) as LedgerItem[]
        const todayTotal = list
          .filter((it) => String(it.dateStr || '') === todayStr)
          .reduce((sum, it) => sum + Math.max(0, Number(it.amount || 0)), 0)

        const mapped = list.map((it) => ({
          id: it._id || `${it.createdAt || 0}-${Math.random()}`,
          title: formatTitle(it.type),
          sub: it.dateStr || '',
          amount: Number(it.amount || 0),
          amountDisplay: formatNumber(Number(it.amount || 0))
        }))

        this.setData({
          todayStr,
          todayTotal: formatMoneyLike(todayTotal),
          balance: formatMoneyLike(balance),
          items: mapped,
          offset: mapped.length,
          hasMore: mapped.length === this.data.pageSize
        })
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
  }
})
