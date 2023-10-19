import {
    workflow,
    getArList
} from '../../src/xr-canvas/utils'
Page({
    data: {
        workflowType: 3,
        p_arData: {},
        workflowData: {},
        width: 400,
        height: 400,
        flag: false,
        XRHeight: 400,
        XRHeight: 400
    },
    async onLoad({ p_arData }) {
        // const {
        //     result
        // } = await getArList("10,1")
        p_arData = JSON.parse(p_arData)

        this.setData({
            flag: true,
            workflowData: p_arData,
            p_arData: { p_ar: p_arData.p_ar }
        })
    },
    onUnload() {
    },
    async loadingChange({
        detail
    }) {

        if (!detail.handleAssetsLoaded) return
        const node = this.node = this.selectComponent('#npm-xrframe').selectComponent('#xr-canvas')
        await this.node.stopAnimatorAndVideo2()
    },

})