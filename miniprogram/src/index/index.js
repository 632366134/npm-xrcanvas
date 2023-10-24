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
        XRHeight: {
            type: Number,
            default: null
        },
        XRWidth: {
            type: Number,
            default: null
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
        resetPositionFlag: false,
        loadingData: {
            '模版一': {
                imageUrl: '../assets/type1.png',
                duration: 10,
                progressColor: "#2DAAD5"
            },
            '模版二': {
                imageUrl: '../assets/type2.png',
                duration: 30,
                progressColor: "#75AD66"
            },
            '模版三': {
                imageUrl: '../assets/type3.png',
                duration: 10,
                progressColor: "#32B690",
            },
            '模版四': {
                imageUrl: '../assets/type4.png',
                duration: 30,
                progressColor: "#BC9F81"
            },
        },
        percent: 0,
        textDuration: 0,
        loadingShow: false,
        soundFlag: true
    },
    /**
     * 组件的方法列表
     */
    lifetimes: {
        async attached() {
            if (this.data.workflowType === 2) {
                const {
                    p_guide,
                    p_scan,
                    p_ending,
                    p_ar
                } = this.data.workflowData
                if (p_guide && p_scan && p_ar && Object.keys(p_ar).length > 0) {
                   
                    if (await this.arCameraShow()) {
                        await xrframe.getCameraAuthorize()

                    }
                    this.guideShow(p_guide)
                } else if (p_guide) {
                    this.guideShow(p_guide, true)
                } else if (p_scan) {
                    if (!await this.arCameraShow()) {
                        this.setData({
                            p_scanFlag: true,
                            unSupportFlag: true
                        })
                    } else {
                        await xrframe.getCameraAuthorize()
                        this.setData({
                            p_scanFlag: true,
                            xrShow: true
                        })
                    }

                } else if (p_ar && Object.keys(p_ar).length > 0) {
                    // const {
                    //     imageUrl,
                    //     duration,
                    //     progressColor
                    // } = this.data.loadingData[p_ar.template_type]
                    if (!await this.arCameraShow()) {
                        this.setData({
                            unSupportFlag2: true,
                            unSupport: this.xrSupport
                        })
                    } else {
                        await xrframe.getCameraAuthorize()
                        this.setData({
                            xrShow: true,
                            resetPositionFlag: true
                        })
                    }


                } else if (p_ending && p_ending.uid) {
                    this.stayPage()
                } else {
                    throw '暂无数据'
                }
            } else if (this.data.workflowType === 1) {
                if (!await this.arCameraShow()) return

                await xrframe.getCameraAuthorize()
                await this.workflow1Fun()
            } else if (this.data.workflowType === 3) {
                if (!await this.arCameraShow()) return

                await xrframe.getCameraAuthorize()
                await this.getWorkList()
            } else if (this.data.workflowType === 4) {
                await xrframe.initXRFrame(this, this.data.XRWidth, this.data.XRHeight)
                
                this.setData({
                    loadingShow: true,
                   
                })
            
            } else {

            }


        },
        detached() {
            if (this.innerAudioContext) {
                this.innerAudioContext.stop()
                this.innerAudioContext = null
            }

            // this.setData({
            //     xrShow: false,
            //     loadingShow:false
            // })
        }
    },
    methods: {
        supportCheck() {
            if (this.xrSupport) {
                this.setData({
                    unSupport: this.xrSupport,
                    unSupportFlag: true
                })
                let timer = setTimeout(() => {
                    clearTimeout(timer)
                    if (this.data.workflowData.p_ending && this.data.workflowData.p_ending.uid) {
                        this.setData({
                            unSupportFlag: false,
                        })
                        this.stayPage()
                    }

                }, 3 * 1000);
            }
        },
        resetPositionBtn() {
            const node = this.selectComponent('#xr-canvas')
            node.resetPosition()
        },
        async getWorkList() {
            const {
                p_guide
            } = this.data.workflowData

            if (p_guide) {
                this.type1guideShow(p_guide)
            } else {
                this.setData({
                    p_scanFlag: true,
                    xrShow: true
                })
            }
        },
        async arCameraShow() {
            await xrframe.initXRFrame(this)
            return await xrframe.handleXRSupport(this)
        },
        async workflow1Fun() {
            this.setData({
                xrShow: true
            })
            const {
                result
            } = await workflow()
            this.setData({
                workflowData: result,
            })

            const {
                p_guide
            } = result

            if (p_guide) {
                this.type3guideShow(p_guide)
            } else {
                this.setData({
                    p_scanFlag: true,
                })
            }

        },
        type3guideShow(p_guide) {
            this.setData({
                p_guideFlag: true,
            })
            if (p_guide.audio_url) {
                this.innerAudioContext = wx.createInnerAudioContext({
                    useWebAudioImplement: true // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
                })
                this.innerAudioContext.src = p_guide.audio_url
                this.innerAudioContext.play() // 播放
                const list = () => {
                    this.innerAudioContext.destroy()
                }
                this.innerAudioContext.onStop(list)

            }
            let timer = setTimeout(() => {
                clearTimeout(timer)

                this.setData({
                    p_guideFlag: false,
                    p_scanFlag: true,
                })

            }, p_guide.duration * 1000);
        },
        async guideShow(p_guide, flag = false) {
            this.setData({
                p_guideFlag: true,
                xrShow: this.xrSupport ? false : !flag
            })
            let list
            if (p_guide.audio_url) {
                this.innerAudioContext = wx.createInnerAudioContext({
                    useWebAudioImplement: true // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
                })
                this.innerAudioContext.src = p_guide.audio_url
                this.innerAudioContext.play() // 播放
                // this.innerAudioContext.loop = true

                list = () => {
                    this.innerAudioContext.destroy()
                }
                this.innerAudioContext.onStop(list)
            }
            if (flag) return
            let timer = setTimeout(() => {
                clearTimeout(timer)
                this.innerAudioContext && this.innerAudioContext.stop();
                this.setData({
                    p_guideFlag: false,
                    p_scanFlag: true,
                    unSupportFlag: this.xrSupport ? true : false
                });
                timer = setTimeout(() => {
                    clearTimeout(timer)
                    if (this.xrSupport) {
                        this.setData({
                            p_scanFlag: false,
                        });
                        this.supportCheck()
                    } else {
                        this.setData({
                            p_scanFlag: false,
                            resetPositionFlag: true
                        });
                    }


                }, 3000);
            }, p_guide.duration * 1000);



        },
        type1guideShow(p_guide, flag = false) {
            this.setData({
                p_guideFlag: true,
                xrShow: !flag
            })
            if (p_guide.audio_url) {
                this.innerAudioContext = wx.createInnerAudioContext({
                    useWebAudioImplement: true // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
                })
                this.innerAudioContext.src = p_guide.audio_url
                this.innerAudioContext.play() // 播放
                // this.innerAudioContext.loop = true

                const list = () => {
                    this.innerAudioContext.destroy()
                }
                this.innerAudioContext.onStop(list)
            }
            if (flag) return
            let timer = setTimeout(async () => {
                clearTimeout(timer)

                this.setData({
                    p_guideFlag: false,
                    p_scanFlag: true,
                })
            }, p_guide.duration * 1000);
        },
        loadingChange({
            detail
        }) {
            if (this.data.workflowType === 4) return

            if (!detail.handleAssetsLoaded) {
                const {
                    imageUrl,
                    duration,
                    progressColor
                } = this.data.loadingData[detail.type]
                if (this.data.workflowType === 2) {
                    this.setData({
                        p_loadingFlag: !detail.handleAssetsLoaded,
                        image_url: imageUrl,
                        textDuration: duration,
                        progressColor
                    })
                } else {
                    this.setData({
                        p_loadingFlag: !detail.handleAssetsLoaded,
                        p_scanFlag: false,
                        image_url: imageUrl,
                        textDuration: duration,
                        progressColor
                    })
                }


            } else {
                if (this.data.workflowType === 2) {
                    this.setData({
                        p_loadingFlag: !detail.handleAssetsLoaded,
                    })
                } else {
                    this.setData({
                        p_loadingFlag: !detail.handleAssetsLoaded,
                        p_scanFlag: false,
                    })
                }


            }

        },

        loadingProgress({
            detail
        }) {

            const {
                index,
                length
            } = detail
            this.setData({
                percent: (index / length).toFixed(2) * 100
            })

        },
        stayPage() {
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
            if (workflowData.p_ending && workflowData.p_ending.uid) {
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

            if (this.data.eventFlag) return
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
            const time = setTimeout(() => {


                this.setData({
                    eventFlag: false,
                    event_image: '',
                    event_url: ''
                })
                clearTimeout(time)
            }, 50);

        },
        bgcAudioFlagChange({
            detail
        }) {
            this.setData({
                bgc_AudioFlag: detail.bgc_AudioFlag,
                soundFlag: true

            })
        },
        bgcMusicChange() {
            const node = this.selectComponent('#xr-canvas')
            if (node.innerAudioContext2.paused) {
                node.innerAudioContext2.play()
                this.setData({
                    soundFlag: true
                })

            } else {
                node.innerAudioContext2.pause()
                this.setData({
                    soundFlag: false
                })
            }

        },
        bgcMusicClose() {
            this.setData({
                soundFlag: false
            })
        },
        move() {

        },
        catchtap() {}
    }
})