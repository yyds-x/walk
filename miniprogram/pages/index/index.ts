Page({
  data: {
    images: {
      banner: '',
      kanbu: '',
      bushutiaozhan: '',
      chuangguan: '',
      mianfeiduobao: '',
      qiandaoyouli: '',
      jiaonangbanner: '',
      '1': '',
      '2': ''
    }
  },
  onLoad() {
    this.loadImages()
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  loadImages() {
    const fileIDs = [
      'cloud://cloud1-4gs1rgg8854b4ac1.636c-cloud1-4gs1rgg8854b4ac1-1417287829/home/banner.svg',
      'cloud://cloud1-4gs1rgg8854b4ac1.636c-cloud1-4gs1rgg8854b4ac1-1417287829/home/kanbu.svg',
      'cloud://cloud1-4gs1rgg8854b4ac1.636c-cloud1-4gs1rgg8854b4ac1-1417287829/home/bushutiaozhan.svg',
      'cloud://cloud1-4gs1rgg8854b4ac1.636c-cloud1-4gs1rgg8854b4ac1-1417287829/home/chuangguan.svg',
      'cloud://cloud1-4gs1rgg8854b4ac1.636c-cloud1-4gs1rgg8854b4ac1-1417287829/home/mianfeiduobao.svg',
      'cloud://cloud1-4gs1rgg8854b4ac1.636c-cloud1-4gs1rgg8854b4ac1-1417287829/home/qiandaoyouli.svg',
      'cloud://cloud1-4gs1rgg8854b4ac1.636c-cloud1-4gs1rgg8854b4ac1-1417287829/home/jiaonangbanner.svg',
      'cloud://cloud1-4gs1rgg8854b4ac1.636c-cloud1-4gs1rgg8854b4ac1-1417287829/home/1.svg',
      'cloud://cloud1-4gs1rgg8854b4ac1.636c-cloud1-4gs1rgg8854b4ac1-1417287829/home/2.svg'
    ]
    const keys = ['banner', 'kanbu', 'bushutiaozhan', 'chuangguan', 'mianfeiduobao', 'qiandaoyouli', 'jiaonangbanner', '1', '2']
    wx.cloud.getTempFileURL({
      fileList: fileIDs,
      success: (res) => {
        const images: any = {}
        res.fileList.forEach((item, index) => {
          images[keys[index]] = item.tempFileURL || '/images/home/' + keys[index] + '.svg'
        })
        this.setData({ images })
      },
      fail: () => {
        const fallback: any = {}
        keys.forEach(key => {
          fallback[key] = '/images/home/' + key + '.svg'
        })
        this.setData({ images: fallback })
      }
    })
  }
})
