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
let flag

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
        p_scanFlag(newVal) {
            if (newVal && this.data.workflowType === 3) {
                this.setData({
                    trackerFlag: true
                })
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
        Assetsloaded: false
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
            console.log(this.scene, this.list)
            xrframe.releaseAssetList(this.scene, this.list)
            await this.stopAnimatorAndVideo()

            this.innerAudioContext2?.stop()
            this.innerAudioContext2?.destroy()
            this.innerAudioContext2 = null
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
            let timer
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


                        if (this.data.workflowData.p_ending && this.data.workflowData.p_ending.text) {
                            await this.StayPageShow(timer)
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
                        }
                        await xrframe.addTemplateTextAnimator(this.data.p_arData.p_ar.template_type, this.scene, this)
                        await this.startAnimatorAndVideo()
                        this.Transform.setData({
                            visible: true
                        })
                        this.firstFlag = true
                    } else {
                        this.triggerEvent('handleAssetsLoaded', {
                            handleAssetsLoaded: true,
                            type: this.data.p_arData.p_ar.template_type
                        }, {
                            composed: true,
                            capturePhase: false,
                            bubbles: true
                        })
                    }

                    this.loading = true
                } else {
                    this.Transform.setData({
                        visible: true
                    })
                    if (this.data.workflowData.p_ending && this.data.workflowData.p_ending.text) {
                        await this.StayPageShow(timer)
                    }
                    if (flag) return
                    await this.startAnimatorAndVideo()
                    if (this.innerAudioContext2) {
                        this.innerAudioContext2.play()
                        this.triggerEvent('bgcAudioFlagChange', {
                            bgc_AudioFlag: true
                        })
                    }
                    flag = true
                }

            } else {
                this.active = false
                clearTimeout(timer)
                this.Transform.setData({
                    visible: false
                })
                // await this.stopAnimatorAndVideo()
            }

        },
        async concatAndLoadAssets(result, flag = false) {
            if (this.data.workflowType !== 3) {
                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: false,
                    type: result.template_type
                }, {
                    composed: true,
                    capturePhase: false,
                    bubbles: true
                })
            }

            // const markerShadow = this.markerShadow = this.scene.getElementById('markerShadow')
            // const markerShadow2 = this.markerShadow2 = this.scene.getElementById('markerShadow2')
            const markerShadow = this.markerShadow
            const markerShadow2 = this.markerShadow2
            this.i = 2
            const list = this.list = await xrframe.concatArrayToObjects(result, true)
            if (list.length === 0) return
            const promiseList = []
            await xrframe.loadENVObject(this.scene, this)
            for (const obj of list) {
                if (obj.type === 'text') {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow, true, this)
                    promiseList.push(p)

                } else if (obj.type === "model") {
                    const p = xrframe.loadModelObject(this.scene, obj, true, markerShadow, this)
                    promiseList.push(p)

                } else if (obj.type === 'video') {
                    const p = xrframe.loadVideoObject(this.scene, obj, true, markerShadow, this)

                } else if (obj.type === 'screen' && result.template_type === "模版四" && this.data.workflowType === 2) {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow2, true, this)

                    promiseList.push(p)
                } else if (obj.type === 'screen' && result.template_type === "模版四" && this.data.workflowType === 3) {
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
                this.data.Assetsloaded = true
                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: true,
                }, {
                    composed: true,
                    capturePhase: false,
                    bubbles: true
                })

                if (flag) return
                if (this.active && this.data.workflowType === 3) {
                    await xrframe.addTemplateTextAnimator(result.template_type, this.scene, this)
                    await xrframe.handleShadowRotate(this)
                    this.handleTemplate3and4(result.template_type)
                    this.stay_duration = result.stay_duration * 1000
                    await this.startAnimatorAndVideo()
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
                    return
                }
                await xrframe.addTemplateTextAnimator(result.template_type, this.scene, this)

                if (this.data.workflowType === 2) {
                    if (result.template_type === "模版四") {
                        await xrframe.handleShadowRotate(this)
                    }
                    if (this.innerAudioContext2) {
                        this.innerAudioContext2.play()
                        this.triggerEvent('bgcAudioFlagChange', {
                            bgc_AudioFlag: true
                        })
                    }

                    return
                } else {
                    await xrframe.handleShadowRotate(this)

                }
                this.setData({
                    trackerFlag: true
                })
            }).catch(err => {
                console.log(err)
            })

        },
        async startAnimatorAndVideo() {
            await xrframe.startAnimatorAndVideo(this)
        },
        async stopAnimatorAndVideo() {
            await xrframe.stopAnimatorAndVideo(this, true)
        },

        async StayPageShow(timer) {
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

            if (this.data.workflowType === 1) {

                let {
                    p_ar
                } = await xrframe.recognizeCigarette(this.scene)

                const {
                    front_image_url,
                    front_image_uid,
                    back_image_url,
                    back_image_uid
                } = p_ar.cigarette
                this.setData({
                    obsList: [{
                        url: front_image_url,
                        id: front_image_uid
                    }, {
                        url: back_image_url,
                        id: back_image_uid
                    }]
                })
                this.stay_duration = p_ar.stay_duration * 1000
                this.handleTemplate3and4(p_ar.template_type)
                await this.concatAndLoadAssets(p_ar)
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
                    let timer2 = this.timer2 = setTimeout(async () => {
                        this.handleTemplate3and4(p_ar.template_type)
                        await this.concatAndLoadAssets(p_ar)
                        this.stay_duration = p_ar.stay_duration * 1000
                        this.Transform.setData({
                            visible: true
                        })
                        await this.startAnimatorAndVideo()
                        let timer
                        if (p_ending && p_ending.text) {
                            await this.StayPageShow(timer)
                        }
                        await this.gyroscope(p_ar)
                        clearTimeout(timer2)
                    }, 3000);

                } else if (p_scan) {
                    return
                    await this.concatAndLoadAssets(p_ar, true)
                } else if (Object.keys(p_ar).length > 0) {
                    // console.log(p_ar.template_type,'p_ar.template_type')
                    this.handleTemplate3and4(p_ar.template_type)
                    await this.concatAndLoadAssets(p_ar)
                    this.Transform.setData({
                        visible: true
                    })
                    await this.startAnimatorAndVideo()
                    await this.gyroscope(p_ar)

                }
            } else if (this.data.workflowType === 3) {
                let obsList = []
                const {
                    cigarette
                } = this.data.p_arData.p_ar
                if (Array.isArray(cigarette)) {
                    console.log('参数是数组');
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
                    console.log('参数不是数组也不是对象');
                    throw '识别图错误!'
                }

                // this.stay_duration = p_ar.stay_duration * 1000
                this.setData({
                    obsList,
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
                this.Transform.position.x -= y * 0.2
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