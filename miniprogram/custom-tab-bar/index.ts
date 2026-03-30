Component({
  data: {
    selected: 0,
    color: "#121834",
    selectedColor: "#00c757",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "推荐",
        type: "simple",
        iconPath: "/images/tabbar/tab_tuijian.png",
        selectedIconPath: "/images/tabbar/tab_tuijian1.svg"
      },
      {
        pagePath: "/pages/welfare/welfare",
        text: "福利",
        type: "simple",
        iconPath: "/images/tabbar/tab_fuli.svg",
        selectedIconPath: "/images/tabbar/tab_fuli1.svg"
      },
      {
        pagePath: "/pages/order/order",
        text: "订单",
        type: "simple",
        iconPath: "/images/tabbar/tab_dingdan.svg",
        selectedIconPath: "/images/tabbar/tab_dingdan1.svg"
      },
      {
        pagePath: "/pages/my/my",
        text: "我的",
        type: "simple",
        iconPath: "/images/tabbar/tab_wode.svg",
        selectedIconPath: "/images/tabbar/tab_wode1.svg"
      }
    ]
  },
  lifetimes: {
    attached() {
      const pages = getCurrentPages()
      if (pages.length === 0) return
      
      const currentPage = pages[pages.length - 1]
      const currentRoute = `/${currentPage.route}`
      
      const selected = this.data.list.findIndex(item => item.pagePath === currentRoute)
      if (selected !== -1 && this.data.selected !== selected) {
        this.setData({ selected })
      }
    }
  },
  methods: {
    switchTab(e: any) {
      const data = e.currentTarget.dataset
      const url = data.path
      
      wx.switchTab({
        url
      })
    }
  }
})
