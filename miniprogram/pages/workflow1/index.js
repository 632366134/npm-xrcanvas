import {
    workflow,
    getArList
} from '../../src/xr-canvas/utils'
Page({
    data: {
        workflowType: 1,
        p_arData: {},
        workflowData: {},
        width: 400,
        height: 400,
        flag: false,
        XRHeight: 400,
        XRHeight: 400
    },
    async onLoad() {
        const {
            result
        } = await getArList("10,1")
        this.setData({
            flag: true
        })
    },
    onUnload() { },
    async loadingChange({
        detail
    }) {
        if (!detail.handleAssetsLoaded) return
        const node = this.node = this.selectComponent('#npm-xrframe').selectComponent('#xr-canvas')
        await this.node.stopAnimatorAndVideo2()
    },
    handleTrackerSwitch({
        detail
    }) {

    },
    stayPage() {

    },
    handleARReady() {

    }

})