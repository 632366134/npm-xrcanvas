import {
    workflow,
    getArList
} from '../../src/xr-canvas/utils'
Page({
    data: {
        workflowType:2,
        p_arData: {},
        workflowData: {},
        width:400,
        height:400,
        flag: false,
        XRHeight:400,
        XRHeight:400
    },
    async onLoad({p_arData}) {
         p_arData = JSON.parse(p_arData)
     
        this.setData({
            flag: true,
            p_arData
        })
    },
    onUnload() {
        this.setData({flag:false})
    },
    async loadingChange({
        detail
    }) {
        console.log(detail, 'loadingchange')
        if (!detail.handleAssetsLoaded) return
        const node = this.node = this.selectComponent('#npm-xrframe').selectComponent('#xr-canvas')
        await this.node.stopAnimatorAndVideo2()
    },

})