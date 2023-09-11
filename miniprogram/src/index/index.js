import {
    workflow,
    getArList
} from '../xr-canvas/utils'
import * as xrframe from '../xr-canvas/xrframe'
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        workflowData: {
            type: Object,
            default: {}
        },
        workflowType: {
            type: Number,
            default: null
        },
        p_arData: {
            type: Object,
            default: {}
        }

    },


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
        type: null,
        workflowData: {},
        p_scanFlag: false,
        p_guideFlag: false,
        p_loadingFlag: false,
        p_endingFlag: false,
        p_arObject: {},
        eventFlag: false,
        event_image: '',
        event_url: '',
        bgc_AudioFlag: false
    },
    /**
     * 组件的方法列表
     */
    lifetimes: {
        async attached() {
            const d = await getArList("10,1")
            console.log(d, 'ddddddd')
            if (this.data.workflowType === 2) {
                const {
                    p_guide,
                    p_scan,
                    p_loading,
                    p_ending,
                } = this.data.workflowData
                if (p_guide && p_scan && p_loading && p_ending) {
                    await this.arCameraShow()
                    this.guideShow(p_guide)
                } else if (p_guide !== null) {
                    this.guideShow(p_guide, false)
                } else if (p_scan !== null) {
                    await this.arCameraShow()

                    this.setData({
                        // p_guideFlag: false,
                        p_scanFlag: true,
                        xrShow: true
                    })
                } else if (p_loading !== null) {
                    await this.arCameraShow()
                    this.setData({
                        xrShow: true
                    })
                } else {
                    this.setData({
                        p_endingFlag: true
                    })
                }
            } else if (this.data.workflowType === 1) {
                await this.arCameraShow()
                await this.workflow1Fun()
            } else {

            }


        },
        detached() {
            this.setData({
                xrShow: false
            })
        }
    },
    methods: {
        async arCameraShow() {
            await xrframe.initXRFrame(this)
            await xrframe.handleXRSupport(this)
        },
        async workflow1Fun() {
            let result = this.data.workflowData
            console.log(result, 'result')
            const {
                p_guide
            } = result
            if (p_guide) {
                this.guideShow(p_guide)
            } else {
                await xrframe.getCameraAuthorize()

                this.setData({
                    p_scanFlag: true,
                    xrShow: true
                })
            }
        },
        guideShow(p_guide) {
            this.setData({
                p_guideFlag: true
            })
            if (p_guide.audio_url) {
                this.innerAudioContext = wx.createInnerAudioContext({
                    useWebAudioImplement: true // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
                })
                this.innerAudioContext.src = p_guide.audio_url
                this.innerAudioContext.play() // 播放
                // this.innerAudioContext.loop = true

                const list = () => {
                    this.innerAudioContext.offEnded(list)
                    this.innerAudioContext.stop()
                    this.innerAudioContext.destroy()
                }
                this.innerAudioContext.onEnded(list)
            }
            let timer = setTimeout(async () => {
                await xrframe.getCameraAuthorize()
                this.setData({
                    p_guideFlag: false,
                    p_scanFlag: true,
                    xrShow: true
                })
                clearTimeout(timer)
            }, p_guide.duration * 1000);
        },
        loadingChange({
            detail
        }) {
            console.log(detail, 'loadingchange')
            if (this.data.workflowData.p_loading) {
                this.setData({
                    p_loadingFlag: !detail.handleAssetsLoaded,
                    p_scanFlag: false
                })
            } else {
                this.setData({
                    p_scanFlag: false
                })
            }

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
                    xrShow: false
                })
            }
        },
        showInteractMedia({
            detail
        }) {
            console.log(detail, 'detail')
            const {
                image_url,
                video_url
            } = detail
            if (!image_url && !video_url) return
            this.setData({
                eventFlag: true,
                event_image: image_url,
                event_url: video_url
            })
        },
        eventFlagChange() {
            this.setData({
                eventFlag: false,
                event_image: null,
                event_url: null
            })
        },
        bgc_AudioFlagChange({
            detail
        }) {
            this.setData({
                bgc_AudioFlag: detail.bgc_AudioFlag,
            })
        }
    }
})