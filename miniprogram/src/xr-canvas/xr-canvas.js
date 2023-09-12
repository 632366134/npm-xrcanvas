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
                p_ar = {
                    "uid": "mar-cjnh9p49aqptihh3qa9g",
                    "name": "新模版四测试",
                    "template_type_uid": "type4",
                    "template_type": "模版四",
                    "style_uid": "t4s1",
                    "style": "样式一",
                    "display_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "display_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "model": {
                        "uid": "m-ci0jk349aqpnlk1unih1",
                        "3d_info": {
                            "position": {
                                "x": 0,
                                "y": -0.1,
                                "z": 0
                            },
                            "scale": {
                                "x": 0.2,
                                "y": 0.2,
                                "z": 0.2
                            },
                            "rotation": {
                                "x": 0,
                                "y": 0,
                                "z": 0
                            }
                        },
                        "file_uid": "f-cimcop49aqpjmjn63ntg",
                        "file_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/models/77d436aff6e9b12e0d9fa525a3f6b25a.gltf"
                    },
                    "text_list": [],
                    "videos": [],
                    "images": [],
                    "transparent_videos": [],
                    "gltf_list": [{
                        "location": "center",
                        "3d_info": {
                            "position": {
                                "x": 0,
                                "y": 0.135,
                                "z": 0.246
                            },
                            "scale": {
                                "x": 0.007,
                                "y": 0.007,
                                "z": 0.007
                            },
                            "rotation": {
                                "x": 0,
                                "y": 0,
                                "z": 0
                            }
                        },
                        "file_uid": "f-cjngvos9aqptihgv3ic0",
                        "file_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/others/b37e5447c46fe7febf8561ddd8309537.glb"
                    }],
                    "cover_image_uid": "f-cjnhaqk9aqptihh3qcog",
                    "cover_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/1c7872cebcb0a552ce34fb962b4f6afa.png",
                    "cigarette": {
                        "sku": "黄山(徽商新概念细支)",
                        "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                        "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                        "back_image_uid": ""
                    },
                    "screen_list": [{
                            "location": "front",
                            "file_uid": "f-cjnh9os9aqptihh3qa50",
                            "file_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/a18634a8f5f9c4a97a63a2440dde4ce8.png",
                            "screen_type": "text",
                            "text_list": [
                                "测试",
                                "1",
                                "1"
                            ],
                            "image_uid": "",
                            "3d_info": {
                                "position": {
                                    "x": 0,
                                    "y": 0.97,
                                    "z": 0.25
                                },
                                "scale": {
                                    "x": 0.85,
                                    "y": 0.52,
                                    "z": 0.1
                                },
                                "rotation": {
                                    "x": 0,
                                    "y": 0,
                                    "z": 0
                                }
                            },
                            "event": {
                                "type": "image",
                                "image_uid": "f-cjhi9dk9aqpnq2csd8s0",
                                "image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/32db50cb9b044f8f2cfb4838a01e76b5.png",
                                "video_uid": ""
                            }
                        },
                        {
                            "location": "left",
                            "file_uid": "f-cjnh9os9aqptihh3qa5g",
                            "file_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/9b26e90acafd6740d61b6d25cc8443b4.png",
                            "screen_type": "text",
                            "text_list": [
                                "视频",
                                "测试",
                                "测试"
                            ],
                            "image_uid": "",
                            "3d_info": {
                                "position": {
                                    "x": -0.23,
                                    "y": 0.97,
                                    "z": -0.116
                                },
                                "scale": {
                                    "x": 0.85,
                                    "y": 0.52,
                                    "z": 0.1
                                },
                                "rotation": {
                                    "x": 0,
                                    "y": 240,
                                    "z": 0
                                }
                            },
                            "event": {
                                "type": "video",
                                "image_uid": "",
                                "video_uid": "f-cjmljfc9aqptihnuhkmg",
                                "video_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/videos/70dd431f08d05b2596b29f2d3ec36cfd.mp4"
                            }
                        },
                        {
                            "location": "right",
                            "file_uid": "f-cjnh9os9aqptihh3qa5g",
                            "file_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/9b26e90acafd6740d61b6d25cc8443b4.png",
                            "screen_type": "text",
                            "text_list": [
                                "视频",
                                "测试",
                                "测试"
                            ],
                            "image_uid": "",
                            "3d_info": {
                                "position": {
                                    "x": 0.23,
                                    "y": 0.97,
                                    "z": -0.116
                                },
                                "scale": {
                                    "x": 0.85,
                                    "y": 0.52,
                                    "z": 0.1
                                },
                                "rotation": {
                                    "x": 0,
                                    "y": 120,
                                    "z": 0
                                }
                            },
                            "event": {
                                "type": "video",
                                "image_uid": "",
                                "video_uid": "f-ci3uu0k9aqpja3sshavg",
                                "video_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/videos/60e9046eb0179907eb932826d935f102.mp4"
                            }
                        }
                    ],
                    "stay_duration": 20
                }
                const {
                    front_image_url,
                    front_image_uid,
                    back_image_url,
                    back_image_uid
                } = p_ar.cigarette
                this.stay_duration = p_ar.stay_duration * 1000
                console.log(p_ar, 'result')
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
            }


        },
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