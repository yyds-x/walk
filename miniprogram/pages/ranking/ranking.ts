import { wxLogin, isLoggedIn } from '../../utils/login'

type RankItem = {
  rank: number
  nickName: string
  avatarUrl: string
  score: number
  scoreDisplay: string
}

const defaultAvatar = '/images/my/head.svg'

Page({
  data: {
    topThree: [] as RankItem[],
    list: [] as RankItem[],
    isLoading: false
  },

  onLoad() {
    if (isLoggedIn()) {
      this.loadRanking()
      return
    }
    this.setData({ isLoading: true })
    wxLogin(() => {
      this.setData({ isLoading: false })
      this.loadRanking()
    })
  },

  onPullDownRefresh() {
    this.loadRanking()
  },

  loadRanking() {
    this.setData({ isLoading: true })
    wx.cloud.callFunction({
      name: 'checkin',
      data: { action: 'ranking' },
      success: (res) => {
        const result = (res as any).result || {}
        const code = (result && typeof result === 'object' && 'code' in result) ? (result as any).code : undefined
        if (code !== 0) {
          // 如果后端暂未支持排行榜，用模拟数据
          this.setMockData()
          return
        }
        const rawList = ((result.data && result.data.list) || []) as any[]
        const mapped: RankItem[] = rawList.map((it: any, idx: number) => ({
          rank: idx + 1,
          nickName: it.nickName || '匿名用户',
          avatarUrl: it.avatarUrl || defaultAvatar,
          score: Number(it.score || it.vitalityBalance || 0),
          scoreDisplay: this.formatScore(Number(it.score || it.vitalityBalance || 0))
        }))
        this.setData({
          topThree: mapped.slice(0, 3),
          list: mapped
        })
      },
      fail: () => {
        this.setMockData()
      },
      complete: () => {
        this.setData({ isLoading: false })
        wx.stopPullDownRefresh()
      }
    })
  },

  setMockData() {
    const mockUsers = [
      { nickName: '健步达人', score: 12680 },
      { nickName: '阳光跑者', score: 9850 },
      { nickName: '飞轮海', score: 8720 },
      { nickName: '一杯咖啡', score: 6540 },
      { nickName: '陕西卫视', score: 5230 },
      { nickName: '往事如烟', score: 4180 }
    ]
    const mapped: RankItem[] = mockUsers.map((it, idx) => ({
      rank: idx + 1,
      nickName: it.nickName,
      avatarUrl: defaultAvatar,
      score: it.score,
      scoreDisplay: this.formatScore(it.score)
    }))
    this.setData({
      topThree: mapped.slice(0, 3),
      list: mapped
    })
  },

  formatScore(num: number): string {
    if (Number.isNaN(num)) return '0.00'
    return num.toFixed(2)
  }
})
