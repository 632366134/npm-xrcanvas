const STATE = {
    NONE: -1,
    MOVE: 0,
    ZOOM_OR_PAN: 1
}
let prevValue;
import './remove-black';
import * as xrframe from './xrframe'
import {
    getArList
} from './utils'

Component({
    properties: {
        workflowType: {
            type: Number,
            default: null
        },
        p_arData: {
            type: Object,
            default: {}
        },
        workflowData: {
            type: Object,
            default: {}

        },
        p_scanFlag: {
            type: Boolean,
            default: false
        }
    },
    observers: {
        async p_scanFlag(newVal) {
            if (newVal) {
                this.data.newval2 = true

            }
            if (newVal && this.data.workflowType === 1) {
                if (!this.scene) return
                if (!this.data.loadingNow) {

                    this.setData({
                        trackerFlag: true,
                        loadingNow: true,
                    })
                    await this.typeScan()
                }

            }
            if (newVal && this.data.workflowType === 3) {
                this.setData({
                    trackerFlag: true
                })


            }
            if (this.index === 1 && this.data.workflowType === 2) {
                const {
                    p_ending,
                } = this.data.workflowData
                let {
                    p_ar
                } = this.data.p_arData
                if (newVal) {} else {
                    if (this.data.Assetsloaded) {
                        this.handleTemplate3and4(p_ar.template_type)
                        if (this.innerAudioContext2) {
                            this.innerAudioContext2.play()
                            this.triggerEvent('bgcAudioFlagChange', {
                                bgc_AudioFlag: true
                            })
                        }
                        this.stay_duration = p_ar.stay_duration * 1000
                        this.Transform.setData({
                            visible: true
                        })
                        if (this.template_type === "模版四") {
                            await xrframe.handleShadowRotate(this)
                        }
                        await xrframe.addTemplateTextAnimator(this.template_type, this.scene, this)
                        await this.startAnimatorAndVideo()
                        if (p_ending && p_ending.text) {
                            await this.StayPageShow()
                        }
                        await this.gyroscope(p_ar)
                    } else {
                        if (!this.data.newval2) return
                        this.triggerEvent('handleAssetsLoaded', {
                            handleAssetsLoaded: false,
                            type: this.template_type
                        }, {
                            composed: true,
                            capturePhase: false,
                            bubbles: true
                        })
                        this.data.loadingNow = true
                    }


                }
            }

        },
        async Assetsloaded(newVal) {

            if (newVal && this.data.workflowType === 2 && this.data.loadingNow) {
                const {
                    p_ending,
                } = this.data.workflowData
                let {
                    p_ar
                } = this.data.p_arData
                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: true,
                    type: this.template_type

                }, {
                    composed: true,
                    capturePhase: false,
                    bubbles: true
                })
                this.handleTemplate3and4(p_ar.template_type)
                this.stay_duration = p_ar.stay_duration * 1000
                this.Transform.setData({
                    visible: true
                })
                if (this.template_type === "模版四") {
                    await xrframe.handleShadowRotate(this)
                }
                await xrframe.addTemplateTextAnimator(this.template_type, this.scene, this)
                await this.startAnimatorAndVideo()
                if (p_ending && p_ending.text) {
                    await this.StayPageShow()
                }
                await this.gyroscope(p_ar)
            }
        }
    },

    data: {
        loaded: false,
        arReady: false,
        gltfFlag: false,
        animatorList: [],
        videoList: [],
        type2: '',
        p_ar: {},
        obsList: [],
        position: [],
        rotation: [],
        Assetsloaded: false,
        trackerFlag: false,
        newval2: false,
        loadingNow: false


    },
    lifetimes: {
        async attached() {
            this.textList = []
            this.animatorList = []
            this.videoList = []
            let position = [0, 0, 0]
            let rotation = [0, 0, 0]
            if (this.data.workflowType === 1) {
                this.setData({
                    arReadyFlag: true,
                    modes: "Marker",
                    trackerFlag2: true,
                    position,
                    rotation
                })
            } else if (this.data.workflowType === 3) {
                this.setData({
                    arReadyFlag: true,
                    modes: "Marker",
                    trackerFlag2: true,
                    position,
                    rotation
                })
            } else {
                if (this.data.p_arData.p_ar?.template_type === "模版四") {
                    position = [0, 3, 4]

                } else {
                    position = [0, 4, 0]
                    rotation = [0, 180, 0]
                }
                this.setData({
                    arReadyFlag: true,
                    modes: "threeDof",
                    trackerFlag2: false,
                    position,
                    rotation

                })
            }
        },
        async detached() {

            xrframe.releaseAssetList(this.scene, this.list)
            await this.stopAnimatorAndVideo()
            if (this.innerAudioContext2) {
                this.innerAudioContext2.stop()
                this.innerAudioContext2.destroy()
                this.innerAudioContext2 = null
            }
            if (this.s) {
                this.s = null
                wx.offGyroscopeChange(this.s)
                wx.stopGyroscope()
            }
            if (this.timer2) {
                clearTimeout(this.timer2)
            }
            if (this.timer) {
                clearTimeout(this.timer)
            }
            if (this.scene) {
                this.scene = null
            }


        },
    },
    methods: {
        async handleTrackerSwitch({
            detail
        }) {
            const active = detail.value;
            const element = detail.el;
            this.triggerEvent('handleTrackerSwitch', {
                handleTrackerSwitch: active
            }, {
                composed: true,
                capturePhase: false,
                bubbles: true
            })
            if (active) {
                this.active = true
                if (this.data.workflowType === 3) {
                    if (!this.loading) {
                        let {
                            p_ar
                        } = await xrframe.recognizeCigarette(this.scene, this)
                    }
                    if (this.data.Assetsloaded) {
                        this.triggerEvent('handleAssetsLoaded', {
                            handleAssetsLoaded: true,
                            type: this.data.p_arData.p_ar.template_type
                        }, {
                            composed: true,
                            capturePhase: false,
                            bubbles: true
                        })
                        if (this.data.workflowData.p_ending && this.data.workflowData.p_ending.text) {
                            await this.StayPageShow()
                        }
                        if (!this.firstFlag) {
                            await xrframe.handleShadowRotate(this)
                            this.handleTemplate3and4(this.data.p_arData.p_ar.template_type)
                            this.stay_duration = this.data.p_arData.p_ar.stay_duration * 1000
                            if (this.innerAudioContext2) {
                                this.innerAudioContext2.play()
                                this.triggerEvent('bgcAudioFlagChange', {
                                    bgc_AudioFlag: true
                                })
                            }
                            await xrframe.addTemplateTextAnimator(this.data.p_arData.p_ar.template_type, this.scene, this)

                        }
                        this.Transform.setData({
                            visible: true
                        })
                        await this.startAnimatorAndVideo()

                        this.firstFlag = true

                    } else {
                        this.triggerEvent('handleAssetsLoaded', {
                            handleAssetsLoaded: false,
                            type: this.data.p_arData.p_ar.template_type
                        }, {
                            composed: true,
                            capturePhase: false,
                            bubbles: true
                        })
                    }
                    this.loading = true
                } else {
                    if (!this.firstFlag) {
                        if (!this.data.Assetsloaded) return
                        await xrframe.handleShadowRotate(this)
                        this.handleTemplate3and4(this.template_type)
                        // this.stay_duration = this.data.p_arData.p_ar.stay_duration * 1000
                        await xrframe.addTemplateTextAnimator(this.template_type, this.scene, this)

                        await this.startAnimatorAndVideo()
                        if (this.innerAudioContext2) {
                            this.innerAudioContext2.play()
                            this.triggerEvent('bgcAudioFlagChange', {
                                bgc_AudioFlag: true
                            })
                        }
                        if (this.data.workflowData.p_ending && this.data.workflowData.p_ending.text) {
                            await this.StayPageShow()
                        }

                        this.firstFlag = true
                        this.Transform.setData({
                            visible: true
                        })

                    } else {
                        this.Transform.setData({
                            visible: true
                        })
                    }

                }

            } else {
                this.active = false
                clearTimeout(this.timer)
                this.Transform.setData({
                    visible: false
                })
                // await this.stopAnimatorAndVideo()
            }

        },
        async concatAndLoadAssets(result) {
            if (this.data.workflowType !== 3 && this.data.workflowType !== 2) {
                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: false,
                    type: result.template_type
                }, {
                    composed: true,
                    capturePhase: false,
                    bubbles: true
                })
            }
            this.template_type = result.template_type
            // const markerShadow = this.markerShadow = this.scene.getElementById('markerShadow')
            // const markerShadow2 = this.markerShadow2 = this.scene.getElementById('markerShadow2')
            const markerShadow = this.markerShadow
            const markerShadow2 = this.markerShadow2
            this.i = 2
            this.result = result
            const list = this.list = await xrframe.concatArrayToObjects(result, true)

            if (list.length === 0) return
            const promiseList = []
            await xrframe.loadENVObject(this.scene, this)
            let d
            for (const obj of list) {
                if (obj.type === 'text') {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow, true, this)
                    promiseList.push(p)

                } else if (obj.type === "model") {
                    const p = xrframe.loadModelObject(this.scene, obj, true, markerShadow, this)
                    promiseList.push(p)

                } else if (obj.type === 'video') {
                    const p = xrframe.loadVideoObject(this.scene, obj, true, markerShadow, this)
                    promiseList.push(p)

                } else if (obj.type === 'screen' && result.template_type === "模版四" && this.data.workflowType !== 4) {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow2, true, this)

                    promiseList.push(p)
                } else if (obj.type === 'screen') {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow, true, this)
                    promiseList.push(p)
                } else if (obj.type === 'image') {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow, true, this)
                    promiseList.push(p)

                }
            }
            await Promise.all(promiseList).then(async results => {
                this.setData({
                    Assetsloaded: true
                })
                if (this.data.workflowType === 2) {
                    return
                }

                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: true,
                }, {
                    composed: true,
                    capturePhase: false,
                    bubbles: true
                })


                // await xrframe.addTemplateTextAnimator(result.template_type, this.scene, this)

                if (this.active && this.data.workflowType === 3) {

                    await xrframe.handleShadowRotate(this)
                    this.handleTemplate3and4(result.template_type)
                    this.stay_duration = result.stay_duration * 1000
                    if (this.innerAudioContext2) {
                        this.innerAudioContext2.play()
                        this.triggerEvent('bgcAudioFlagChange', {
                            bgc_AudioFlag: true
                        })
                    }
                    this.Transform.setData({
                        visible: true
                    })
                    this.firstFlag = true
                    await xrframe.addTemplateTextAnimator(this.result.template_type, this.scene, this)
                    this.startAnimatorAndVideo()

                    return
                }

                if (this.active && this.data.workflowType === 1) {
                    await xrframe.handleShadowRotate(this)
                    this.handleTemplate3and4(result.template_type)
                    this.stay_duration = result.stay_duration * 1000
                    if (this.innerAudioContext2) {
                        this.innerAudioContext2.play()
                        this.triggerEvent('bgcAudioFlagChange', {
                            bgc_AudioFlag: true
                        })
                    }
                    if (this.data.workflowData.p_ending && this.data.workflowData.p_ending.text) {
                        await this.StayPageShow()
                    }
                    this.Transform.setData({
                        visible: true
                    })
                    await xrframe.addTemplateTextAnimator(this.result.template_type, this.scene, this)
                    this.startAnimatorAndVideo()

                    this.firstFlag = true
                }


                // if (this.data.workflowType === 2) {
                //     if (result.template_type === "模版四") {
                //         await xrframe.handleShadowRotate(this)
                //     }
                //     this.handleTemplate3and4(result.template_type)

                //     if (this.innerAudioContext2) {
                //         this.innerAudioContext2.play()
                //         this.triggerEvent('bgcAudioFlagChange', {
                //             bgc_AudioFlag: true
                //         })
                //     }
                //     await xrframe.addTemplateTextAnimator(this.result.template_type, this.scene, this)

                //     this.startAnimatorAndVideo()

                //     return
                // }
                this.setData({
                    trackerFlag: true
                })


            })

        },
        startAnimatorAndVideo() {
            xrframe.startAnimatorAndVideo(this)
        },
        async stopAnimatorAndVideo() {
            await xrframe.stopAnimatorAndVideo(this, true)
        },

        async StayPageShow() {
            if (this.stay_duration) {
                this.timer = setTimeout(() => {
                    this.triggerEvent('stayPage', {}, {
                        composed: true,
                        capturePhase: false,
                        bubbles: true
                    })
                    clearTimeout(this.timer)
                }, this.stay_duration);
            }

        },
        trackFlagFun(flag) {
            this.setData({
                trackerFlag: true
            })
        },
        handleReady({
            detail
        }) {
            this.triggerEvent('handleReady', {}, {
                composed: true,
                capturePhase: false,
                bubbles: true
            })
            const xrScene = this.scene = detail.value;
            this.xrFrameSystem = wx.getXrFrameSystem();

        },
        handleAssetsProgress: function ({
            detail
        }) {},
        handleAssetsLoaded: function ({
            detail
        }) {},
        async typeScan() {
            let {
                p_ar
            } = await xrframe.recognizeCigarette(this.scene)
            if (!!!p_ar) return
            const {
                front_image_url,
                front_image_uid,
                back_image_url,
                back_image_uid
            } = p_ar?.cigarette
            let obsList = [{
                url: front_image_url,
                id: front_image_uid
            }, {
                url: back_image_url,
                id: back_image_uid
            }]
            let obslist1 = obsList.filter(v => {
                return typeof v.url !== 'undefined' && v.url !== null
            })

            this.setData({
                obsList: obslist1,
            })
            this.stay_duration = p_ar.stay_duration * 1000
            await this.concatAndLoadAssets(p_ar)
        },
        async handleARReady({
            detail
        }) {
            this.triggerEvent('handleARReady', {}, {
                composed: true,
                capturePhase: false,
                bubbles: true
            })
            const markerShadow = this.markerShadow = this.scene.getElementById('markerShadow')
            const markerShadow2 = this.markerShadow2 = this.scene.getElementById('markerShadow2')
            this.Transform = this.markerShadow.getComponent(this.xrFrameSystem.Transform)
            this.Transform.setData({
                visible: false
            })
            if (this.data.workflowType === 1) {
                if (!this.data.p_scanFlag)  return
                if(!this.data.loadingNow){
                    this.setData({
                        trackerFlag: true,
                        loadingNow: true,
                    })
                    await this.typeScan()
                }
                   

            } else if (this.data.workflowType === 2) {

                const {
                    p_guide,
                    p_scan,
                    p_ending,
                } = this.data.workflowData
                let {
                    p_ar
                } = this.data.p_arData
                if (p_guide && p_scan && p_ending && Object.keys(p_ar).length > 0) {
                    this.index = 1
                    await this.concatAndLoadAssets(p_ar)


                } else if (p_scan) {
                    return
                } else if (Object.keys(p_ar).length > 0) {
                    this.triggerEvent('handleAssetsLoaded', {
                        handleAssetsLoaded: false,
                        type: p_ar.template_type
                    }, {
                        composed: true,
                        capturePhase: false,
                        bubbles: true
                    })
                    this.setData({
                        loadingNow: true
                    })
                    await this.concatAndLoadAssets(p_ar)

                }
            } else if (this.data.workflowType === 3) {
                let obsList = []
                const {
                    cigarette
                } = this.data.p_arData.p_ar
                if (Array.isArray(cigarette)) {
                    ;
                    for (const obj of cigarette) {
                        if (!!obj.front_image_url && !!obj.front_image_uid) {
                            const o = {
                                url: obj.front_image_url,
                                id: obj.front_image_uid
                            }
                            obsList.push(o)
                        } else if (!!obj.back_image_url && !!obj.back_image_uid) {
                            const o = {
                                url: obj.back_image_url,
                                id: obj.back_image_uid
                            }
                            obsList.push(o)
                        } else {

                        }
                    }
                } else if (typeof cigarette === 'object' && cigarette !== null) {
                    obsList = [{
                        url: cigarette.front_image_url,
                        id: cigarette.front_image_uid
                    }, {
                        url: cigarette.back_image_url,
                        id: cigarette.back_image_uid
                    }]

                } else {
                    ;
                    throw '识别图错误!'
                }

                // this.stay_duration = p_ar.stay_duration * 1000
                let obslist1 = obsList.filter(v => {
                    return typeof v.url !== 'undefined' && v.url !== null
                })

                this.setData({
                    obsList: obslist1,
                    // trackerFlag: true
                })
                await this.concatAndLoadAssets(this.data.p_arData.p_ar)
                // this.handleTemplate3and4(p_ar.template_type)
                // await this.concatAndLoadAssets(p_ar)
            }


        },
        async gyroscope(p_ar) {
            if (p_ar.template_type === "模版四") return
            let s = this.s = ({
                y
            }) => {
                if (y > 0.15 || y < -0.15) {
                    this.Transform.position.x += y / 17
                }
            }
            await wx.startGyroscope({
                interval: 'ui',
                success() {
                    wx.onGyroscopeChange(s)
                }
            })
        },
        handleTemplate3and4(type) {
            if (type === "模版二" || type === "模版三" || type === "模版四") {

                this.innerAudioContext2 = wx.createInnerAudioContext({
                    useWebAudioImplement: false // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
                })
                this.innerAudioContext2.src = xrframe.backgroundAudioList[type]
                this.innerAudioContext2.loop = true
                // await xrframe.audioFadeOut(this.innerAudioContext2)
            }
        },
        removeFromScene(uid) {
            xrframe.removeFromScene(this.markerShadow, this.markerShadow2, uid)
        }


    }
})