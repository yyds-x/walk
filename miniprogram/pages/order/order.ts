Page({
  data: {
    tabs: ['兑换订单', '夺宝订单', '闯关纪录', '幸运礼盒'],
    activeTab: 0,
    orders: [
      {
        id: '3743834',
        status: '已完成',
        date: '2022-12-23 09:12:23',
        image: '/images/Icon1.png', // Placeholder
        title: '白千层肚150g新鲜毛肚牛杂涮火锅食材',
        value: '22',
        tag: '包邮'
      },
      {
        id: '3743834',
        status: '已完成',
        date: '2022-12-23 09:12:23',
        image: '/images/Icon2.png', // Placeholder
        title: '雄丰牛筋丸500g肉丸火锅料麻辣烫丸子速冻食品餐饮',
        value: '22',
        tag: '包邮'
      },
      {
        id: '3743834',
        status: '已完成',
        date: '2022-12-23 09:12:23',
        image: '/images/Icon3.png', // Placeholder
        title: '谷稼小庄浓缩果汁橙汁商用金桔柠檬饮料',
        value: '22',
        tag: '包邮'
      }
    ]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  onTabClick(e: any) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index
    });
    // Here you would typically filter orders based on the tab
  }
})
