import {
    workflow
} from '../xr-canvas/utils'
import * as xrframe from '../xr-canvas/xrframe'
Component({

    /**
     * 组件的属性列表
     */
    properties: {

    },
    observers: {},

    /**
     * 组件的初始数据
     */
    data: {
        width: 300,
        height: 300,
        renderWidth: 300,
        renderHeight: 300,
        texts: [],
        canvasWidth: 320, // 设置canvas宽度
        canvasHeight: 240, // 设置canvas高度
        xrShow: false,
        resultImage: '',
        lastShow: false,
        unSupport: '',
        typeRaw: '',
        workflowData: {},
        p_scanFlag: false,
        p_guideFlag: false,
        p_loadingFlag: false,
        p_endingFlag: false
    },
    /**
     * 组件的方法列表
     */
    lifetimes: {
        async attached() {
            await xrframe.handleXRSupport(this)

            if (this.data.xrShow !== true) return
            await xrframe.getCameraAuthorize()
            await xrframe.initXRFrame(this)
            const {
                err_code,
                result
            } = await workflow()
            if (err_code !== 0) return
            this.setData({
                workflowData: result,
                typeRaw: 1
            })
            console.log(result)
            if (result.p_guide) {
                this.setData({
                    p_guideFlag: true
                })
                if (result.p_guide.audio_url) {
                    this.innerAudioContext = wx.createInnerAudioContext({
                        useWebAudioImplement: true // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
                    })
                    this.innerAudioContext.src = result.p_guide.audio_url
                    this.innerAudioContext.play() // 播放
                    const list = () => {
                        this.setData({
                            p_guideFlag: false,
                            p_scanFlag: true
                        })
                        this.innerAudioContext.offEnded(list)
                        this.innerAudioContext.destroy()
                    }
                    this.innerAudioContext.onEnded(list)
                    // this.innerAudioContext.loop = true
                }
            } else {
                this.setData({
                    p_scanFlag: true
                })
            }

        },
        detached() {
            this.setData({
                xrShow: false
            })
        }
    },
    methods: {
        loadingChange({
            detail
        }) {
            console.log(detail, 'loadingchange')
            this.setData({
                p_loadingFlag: !detail.handleAssetsLoaded,
                p_scanFlag: false
            })
        },
        loadingProgress({
            detail
        }) {
            console.log(detail, 'loadingProgress')

        },
        stayPage() {
            console.log('stayPage')
            if (this.data.workflowData.p_ending) {
                this.setData({
                    p_endingFlag: true,
                    xrShow:false
                })
            }
        }
    }
})