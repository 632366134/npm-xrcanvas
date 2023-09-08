import {
    getArList
} from '../../src/xr-canvas/utils'
Page({
    data: {
        workflowType: 2,
        workflowObject: {
            'p_guide': null,
            'p_scan': {
                image_url: 'https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/d8ee79214bf0f8149d83fa7b852d3611.png',
                video_url: null,
                audio_url: null
            },
            'p_loading': null,
            'p_ending': null,
        },
        p_arRawData: {}
    },
    async onLoad() {
        console.log('onload')
        const {
            result
        } = await getArList('1,0')
        console.log(result, 'result')
        this.setData({
            p_arRawData: result.items[0].p_ar
        })
        const node = this.selectComponent('#npm-xrframe').selectComponent('#xr-canvas')
    },
    onUnload() {


    },


})