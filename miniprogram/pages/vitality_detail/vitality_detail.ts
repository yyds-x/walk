import { wxLogin, isLoggedIn } from '../../utils/login'

type LedgerItem = {
  _id?: string
  type?: string
  amount?: number
  dateStr?: string
  createdAt?: number
}

function formatTitle(type?: string) {
  if (type === 'checkin') return '签到'
  return '活力值变动'
}

Page({
  data: {
    items: [] as Array<{ id: string; title: string; sub: string; amount: number }>,
    offset: 0,
    pageSize: 20,
    hasMore: true,
    isLoading: false
  },

  onLoad() {
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

  loadMore(reset: boolean) {
    if (this.data.isLoading) return
    if (!this.data.hasMore && !reset) return

    const offset = reset ? 0 : this.data.offset
    const pageSize = this.data.pageSize

    this.setData({ isLoading: true })
    wx.cloud.callFunction({
      name: 'checkin',
      data: { action: 'ledger', offset, pageSize },
      success: (res) => {
        const result = res.result as any
        if (result?.code !== 0) {
          wx.showToast({ title: result?.message || '加载失败', icon: 'none' })
          return
        }

        const list = (result?.data?.list || []) as LedgerItem[]
        const mapped = list.map((it) => ({
          id: it._id || `${it.createdAt || 0}-${Math.random()}`,
          title: formatTitle(it.type),
          sub: it.dateStr || '',
          amount: Number(it.amount || 0)
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
  }
})

