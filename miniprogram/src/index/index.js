import {
    workflow,
    getArList,
    getmyworkList
} from '../xr-canvas/utils'
import * as xrframe from '../xr-canvas/xrframe'
var WxParse = require('../wxParse/wxParse');
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
        },
        screenListRaw: {
            type: Array,
            default: []
        },
        textListRaw: {
            type: Array,
            default: []
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
        bgc_AudioFlag: false,
        loadingData: {
            '模版一': {
                imageUrl: '/assets/type1.png',
                duration: 10,
                progressColor: "#87CEEB"
            },
            '模版三': {
                imageUrl: '/assets/type3.png',
                duration: 10,
                progressColor: "#00FF00",
            },
            '模版四': {
                imageUrl: '/assets/type4.png',
                duration: 30,
                progressColor: "#808080"
            },
        },
        percent: 0,
        textDuration: 0,
        loadingShow: false
    },
    /**
     * 组件的方法列表
     */
    lifetimes: {
        async attached() {
            console.log(this.data.workflowType)
            if (this.data.workflowType === 2) {
                const {
                    p_guide,
                    p_scan,
                    p_ending,
                } = this.data.workflowData
                const {
                    p_ar
                } = this.data.p_arData
                if (p_guide && p_scan && p_ending && p_ar && Object.keys(p_ar).length > 0) {
                    await this.arCameraShow()
                    await xrframe.getCameraAuthorize()
                    this.guideShow(p_guide)
                } else if (p_guide) {
                    this.guideShow(p_guide, true)
                } else if (p_scan) {
                    await this.arCameraShow()
                    await xrframe.getCameraAuthorize()

                    this.setData({
                        p_scanFlag: true,
                        xrShow: true
                    })
                } else if (p_ar && Object.keys(p_ar).length > 0) {
                    // const {
                    //     imageUrl,
                    //     duration,
                    //     progressColor
                    // } = this.data.loadingData[p_ar.template_type]
                    await this.arCameraShow()
                    await xrframe.getCameraAuthorize()
                    this.setData({
                        xrShow: true,
                        // p_loadingFlag: true,
                        // image_url: imageUrl,
                        // textDuration: duration,
                        // progressColor
                    })
                } else if (p_ending) {
                    this.stayPage()
                } else {
                    throw '暂无数据'
                }
            } else if (this.data.workflowType === 1) {
                await this.arCameraShow()
                await xrframe.getCameraAuthorize()
                await this.workflow1Fun()
            } else if (this.data.workflowType === 3) {
                await this.arCameraShow()
                await xrframe.getCameraAuthorize()
                await this.getWorkList()
            } else if (this.data.workflowType === 4) {
                await xrframe.initXRFrame(this)
                await xrframe.handleXRSupport(this)
                // let screenListRaw = this.data.p_arData.p_ar.screen_list
                // delete this.data.p_arData.p_ar.screen_list
                this.setData({
                    loadingShow: true,
                    // p_arData: this.data.p_arData,
                    // screenListRaw
                })
                // screenListRaw[1].file_url="https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/18ead05029aa0d145111ff37f7843472.png"
                // setTimeout(() => {
                //     this.setData({
                //         screenListRaw
                //     })
                // }, 8000);
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
        async getWorkList() {
            let {
                result
            } = await getmyworkList(`?pl=10,0`)
            result = result.works[1]
            this.setData({
                workflowData: result,
                p_arData: result.p_ar
            })
            console.log(result, 'result')
            const {
                p_guide
            } = result

            if (p_guide) {
                this.guideShow(p_guide)
            } else {
                this.setData({
                    p_scanFlag: true,
                    xrShow: true
                })
            }
        },
        async arCameraShow() {
            await xrframe.initXRFrame(this)
            await xrframe.handleXRSupport(this)
        },
        async workflow1Fun() {
            const {
                result
            } = await workflow()
            this.setData({
                workflowData: result
            })
            const {
                p_guide
            } = result

            if (p_guide) {
                this.type3guideShow(p_guide)
            } else {
                this.setData({
                    p_scanFlag: true,
                    xrShow: true
                })
            }
        },
        type3guideShow(p_guide) {
            this.setData({
                p_guideFlag: true,
                xrShow: true
            })
            if (p_guide.audio_url) {
                this.innerAudioContext = wx.createInnerAudioContext({
                    useWebAudioImplement: true // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
                })
                this.innerAudioContext.src = p_guide.audio_url
                this.innerAudioContext.play() // 播放
                const list = () => {
                    this.innerAudioContext.offEnded(list)
                    this.innerAudioContext.stop()
                    this.innerAudioContext.destroy()
                }
                this.innerAudioContext.onEnded(list)
            }
            let timer = setTimeout(async () => {
                this.setData({
                    p_guideFlag: false,
                    p_scanFlag: true,
                })
                clearTimeout(timer)
            }, p_guide.duration * 1000);
        },
        guideShow(p_guide, flag = false) {
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
            if (flag) return
            let timer = setTimeout(async () => {
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
            if (detail.handleAssetsLoaded) {
                const {
                    imageUrl,
                    duration,
                    progressColor
                } = this.data.loadingData[detail.type]
                console.log(imageUrl, duration, progressColor)
                this.setData({
                    p_loadingFlag: detail.handleAssetsLoaded,
                    p_scanFlag: false,
                    image_url: imageUrl,
                    textDuration: duration,
                    progressColor
                })

            } else {
                this.setData({
                    p_loadingFlag: detail.handleAssetsLoaded,
                    p_scanFlag: false,
                })

            }

        },
        loadingProgress({
            detail
        }) {
            console.log(detail, 'loadingProgress')
            const {
                index,
                length
            } = detail
            this.setData({
                percent: (index / length).toFixed(2) * 100
            })

        },
        stayPage() {
            console.log('stayPage')
            const {
                eventFlag,
                bgc_AudioFlag,
                workflowData
            } = this.data
            if (eventFlag) {
                this.setData({
                    eventFlag: false
                })
            }
            if (bgc_AudioFlag) {
                this.setData({
                    bgc_AudioFlag: false

                })
            }
            if (workflowData.p_ending) {
                var article = `<div>${workflowData.p_ending.text}</div>`;
                var that = this;
                WxParse.wxParse('article', 'html', article, that);

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
            if (image_url) {
                this.setData({
                    eventFlag: true,
                    event_image: image_url,
                })
            }
            if (video_url) {
                this.setData({
                    eventFlag: true,
                    event_url: video_url
                })
            }

        },
        eventFlagChange() {
            this.setData({
                eventFlag: false,
                event_image: null,
                event_url: null
            })
        },
        bgcAudioFlagChange({
            detail
        }) {
            console.log(detail, 'bgc_audioflagchange')
            this.setData({
                bgc_AudioFlag: detail.bgc_AudioFlag,
            })
        },
        bgcMusicChange() {
            const node = this.selectComponent('#xr-canvas')
            console.log(node.innerAudioContext2, 'innerAudioContext2')
            if (node.innerAudioContext2.paused) {
                node.innerAudioContext2.play()

            } else {
                node.innerAudioContext2.pause()
            }

        },
    }
})