import { wxLogin, isLoggedIn, getUserInfo } from '../../utils/login'

Page({
  data: {
    balance: 0,
    balanceDisplay: '0.00',
    inputAmount: '',
    canSubmit: false
  },

  onLoad() {
    if (isLoggedIn()) {
      this.loadBalance()
    } else {
      wxLogin(() => {
        this.loadBalance()
      })
    }
  },

  onShow() {
    this.loadBalance()
  },

  loadBalance() {
    const userInfo = getUserInfo()
    if (userInfo) {
      const bal = Number(userInfo.income || userInfo.vitalityBalance || 0)
      this.setData({
        balance: bal,
        balanceDisplay: bal.toFixed(2)
      })
    }
  },

  onAmountInput(e: any) {
    const val = e.detail.value || ''
    const num = parseFloat(val)
    this.setData({
      inputAmount: val,
      canSubmit: !isNaN(num) && num >= 1 && num <= this.data.balance
    })
  },

  fillAll() {
    const bal = this.data.balance
    if (bal <= 0) return
    const val = bal.toFixed(2)
    this.setData({
      inputAmount: val,
      canSubmit: bal >= 1
    })
  },

  doWithdraw() {
    if (!this.data.canSubmit) return
    const amount = parseFloat(this.data.inputAmount)
    if (isNaN(amount) || amount < 1) {
      wx.showToast({ title: '最少提现1元', icon: 'none' })
      return
    }
    if (amount > this.data.balance) {
      wx.showToast({ title: '余额不足', icon: 'none' })
      return
    }
    wx.showModal({
      title: '确认提现',
      content: `确认提现 ${amount.toFixed(2)} 元？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '提现申请已提交', icon: 'success' })
          this.setData({ inputAmount: '', canSubmit: false })
        }
      }
    })
  },

  goHistory() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  inviteFriend() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  }
})
