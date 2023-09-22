import {
    workflow,
    getArList
} from '../../src/xr-canvas/utils'
Page({
    data: {
        workflowType:1,
        p_arData: {},
        workflowData: {},
        width:400,
        height:400,
        flag: false,
        XRHeight:400,
        XRHeight:400
    },
    async onLoad() {
        const {
            result
        } = await getArList("10,1")
        console.log(result, 'd')
        this.setData({
            flag: true
        })
    },
    onUnload() {
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