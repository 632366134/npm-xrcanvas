const STATE = {
    NONE: -1,
    MOVE: 0,
    ZOOM_OR_PAN: 1
}
let prevValue;
import './remove-black';
import jsonData from './test'
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

        }
    },
    observers: {},

    data: {
        loaded: false,
        arReady: false,
        gltfFlag: false,
        animatorList: [],
        videoList: [],
        type2: '',
        p_ar: {},
        obsList: [],
        position: []
    },
    lifetimes: {
        async attached() {
            this.textList = []
            this.animatorList = []
            this.videoList = []
            let position = [0, 0, 0]
            if (this.data.workflowType === 1) {
                this.setData({
                    arReadyFlag: true,
                    modes: "Marker",
                    trackerFlag2: true,
                    position
                })
            } else if (this.data.workflowType === 3) {
                this.setData({
                    arReadyFlag: true,
                    modes: "Marker",
                    trackerFlag2: true,
                    trackerFlag: true,
                    position
                })
            } else {
                if (this.data.p_arData.p_ar?.template_type === "模版四") {
                    position = [0, 0, 4]

                } else {
                    position = [0, 2, 4]
                }
                this.setData({
                    arReadyFlag: true,
                    modes: "threeDof",
                    trackerFlag2: false,
                    position,

                })
            }
        },
        detached() {
            xrframe.releaseAssetList(this, this.list)
            wx.offGyroscopeChange(this.x)
            wx.stopGyroscope()
            this.triggerEvent('bgc_AudioFlagChange', {
                bgc_AudioFlag: false
            })
            this.innerAudioContext2?.stop()
            this.innerAudioContext2?.destroy()
            this.innerAudioContext2 = null
            if (this.x) {
                this.x = null
            }
            if (this.scene) {
                this.scene = null
            }
            if (this.anchor) {
                this.anchor = null
            }
            if (this.trs) {
                this.trs = null
            }
            if (this.GLTF) {
                this.GLTF = null
            }
            if (this.xrgltf) {
                this.xrgltf = null
            }
            if (this.tmpV3) {
                this.tmpV3 = null
            }
            if (this.gltfModel) {
                this.gltfModel = null
            }
            if (this.gltfModel) {
                this.gltfModel = null
            }
            if (this.gltfModel) {
                this.gltfModel = null
            }
            if (this.gltfItemSubTRS) {
                this.gltfItemSubTRS = null
            }
            if (this.videoTRS) {
                this.videoTRS = null
            }
            if (this.gltfItemTRS) {
                this.gltfItemTRS = null
            }
        },
    },
    methods: {
        async handleTrackerSwitch({
            detail
        }) {
            let timer
            console.log('tracked match', detail)
            const active = detail.value;
            const element = detail.el;
            this.triggerEvent('handleTrackerSwitch', {
                handleTrackerSwitch: active
            })
            if (active) {
                this.Transform.setData({
                    visible: true
                })
                await this.StayPageShow(timer)
                if (flag) return
                await this.startAnimatorAndVideo()
                this.innerAudioContext2?.play() // 播放
                this.triggerEvent('bgcAudioFlagChange', {
                    bgc_AudioFlag: true
                })
                flag = true

            } else {
                clearTimeout(timer)
                this.Transform.setData({
                    visible: false
                })
                // await this.stopAnimatorAndVideo()
            }

        },
        async concatAndLoadAssets(result, flag = false) {
            this.triggerEvent('handleAssetsLoaded', {
                handleAssetsLoaded: true,
                type: result.template_type
            })
            const markerShadow = this.markerShadow = this.scene.getElementById('markerShadow')
            const markerShadow2 = this.markerShadow2 = this.scene.getElementById('markerShadow2')

            const list = this.list = await xrframe.concatArrayToObjects(result, true)
            console.log(list, 'list', markerShadow)
            if (list.length === 0) return
            const promiseList = []
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
                } else if (obj.type === 'screen') {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow, true, this)
                    promiseList.push(p)
                } else if (obj.type === 'image') {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow, true, this)
                    promiseList.push(p)
                }
            }
            await Promise.all(promiseList).then(async results => {
                console.log(results, 'resultsresultsresultsresults')
                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: false,
                }, {
                    composed: true,
                    capturePhase: true,
                    bubbles: true
                })
                if (flag) return
                await xrframe.addTemplateTextAnimator(result.template_type, this.scene, this)
                this.Transform = this.markerShadow.getComponent(this.xrFrameSystem.Transform)
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
        async LoadAssetsAfter() {

        },
        async startAnimatorAndVideo() {
            await xrframe.startAnimatorAndVideo(this)
        },
        async stopAnimatorAndVideo() {
            await xrframe.stopAnimatorAndVideo(this, true)
        },
        async stopAnimatorAndVideo2() {
            console.log('222')
        },
        async StayPageShow(timer) {
            if (this.stay_duration) {
                timer = this.timer = setTimeout(() => {
                    this.triggerEvent('stayPage')
                    clearTimeout(timer)
                }, this.stay_duration);
            }

        },
        handleReady({
            detail
        }) {
            this.triggerEvent('handleReady')
            const xrScene = this.scene = detail.value;
            this.xrFrameSystem = wx.getXrFrameSystem();
            console.log('xr-scene', xrScene);

        },
        handleAssetsProgress: function ({
            detail
        }) {
            console.log('assets progress', detail.value);
        },
        handleAssetsLoaded: function ({
            detail
        }) {
            console.log('assets loaded', detail.value);

        },
        async handleARReady({
            detail
        }) {
            this.triggerEvent('handleARReady')
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
                this.stay_duration = p_ar.stay_duration * 1000
                this.setData({
                    obsList: [{
                        url: front_image_url,
                        id: front_image_uid
                    }, {
                        url: back_image_url,
                        id: back_image_uid
                    }]
                })
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
                    let timer2 = setTimeout(async () => {
                        this.handleTemplate3and4(p_ar.template_type)
                        await this.concatAndLoadAssets(p_ar)
                        this.stay_duration = p_ar.stay_duration * 1000
                        this.Transform.setData({
                            visible: true
                        })
                        await this.startAnimatorAndVideo()
                        let timer
                        await this.StayPageShow(timer)
                        await this.gyroscope(p_ar)
                        console.log(this.scene)
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
                const obsList = []
                const {
                    cigarette
                } = this.data.workflowData
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
                // this.stay_duration = p_ar.stay_duration * 1000
                this.setData({
                    obsList
                })
                // this.handleTemplate3and4(p_ar.template_type)
                // await this.concatAndLoadAssets(p_ar)
            }


        },
        createObslist() {},
        async gyroscope(p_ar) {
            if (p_ar.template_type === "模版四") return
            let s = this.s = ({
                y
            }) => {
                this.Transform.position.x -= y * 0.1
            }
            await wx.startGyroscope({
                interval: 'ui',
                success() {
                    wx.onGyroscopeChange(s)
                }
            })
        },
        handleTemplate3and4(type) {
            console.log('handleTemplate3and4,t', type)
            if (type === "模版三" || type === "模版四") {

                this.innerAudioContext2 = wx.createInnerAudioContext({
                    useWebAudioImplement: false // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
                })
                console.log(xrframe.backgroundAudioList[type], 'xrframe.backgroundAudioList.type')
                this.innerAudioContext2.src = xrframe.backgroundAudioList[type]
                this.innerAudioContext2.loop = true
                // await xrframe.audioFadeOut(this.innerAudioContext2)
            }
        }


    }
})