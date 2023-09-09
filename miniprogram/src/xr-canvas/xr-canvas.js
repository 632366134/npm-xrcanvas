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
        obsList: []
    },
    lifetimes: {
        async attached() {
            this.textList = []
            this.animatorList = []
            this.videoList = []
            if (this.data.workflowType === 1) {
                this.setData({
                    arReadyFlag: true,
                    modes: "Marker",
                    trackerFlag2: true,
                })
            } else {
                this.setData({
                    arReadyFlag: true,
                    modes: "threeDof",
                    trackerFlag2: false,
                })
            }
        },
        detached() {
            xrframe.releaseAssetList(this, this.list)
            wx.offGyroscopeChange(this.x)
            wx.stopGyroscope()
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
                flag = true

            } else {
                clearTimeout(timer)
                this.Transform.setData({
                    visible: false
                })
                // await this.stopAnimatorAndVideo()
            }

        },
        async concatAndLoadAssets(result) {
            this.triggerEvent('handleAssetsLoaded', {
                handleAssetsLoaded: false,
            })
            const markerShadow = this.markerShadow = this.scene.getElementById('markerShadow')
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

                } else if (obj.type === 'screen') {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow, true, this)
                    promiseList.push(p)
                } else if (obj.type === 'image') {
                    const p = xrframe.loadImageObject(this.scene, obj, markerShadow, true, this)
                    promiseList.push(p)
                }
            }
            await Promise.all(promiseList).then(async results => {

                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: true,
                })
                await xrframe.addTemplateTextAnimator(result.template_type, this.scene, this)
                // await xrframe.addTemplateTextAnimator('模版四', this.scene, this)
                this.Transform = this.markerShadow.getComponent(this.xrFrameSystem.Transform)


                await xrframe.handleShadowRotate(this)
                if (this.data.workflowType === 2) return
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
            timer = this.timer = setTimeout(() => {
                this.triggerEvent('stayPage')
                clearTimeout(timer)
            }, this.stay_duration);
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
                const {
                    p_ar
                } = await xrframe.recognizeCigarette(this.scene)
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
                await this.concatAndLoadAssets(p_ar)
            } else if (this.data.workflowType === 2) {
                let {
                    p_ar
                } = this.data.p_arData
                await this.concatAndLoadAssets(p_ar)
                this.stay_duration = p_ar.stay_duration * 1000
                this.Transform.setData({
                    visible: true
                })
                await this.startAnimatorAndVideo()
                await this.StayPageShow()

                // const camera = this.camera = this.scene.getElementById('camera')
                // this.scene.removeChild(this.markerShadow)
                // camera.addChild(this.markerShadow)
                if (p_ar.template_type === "模版四") return
                let s = this.s = ({
                    y
                }) => {
                    this.Transform.position.x -= y * 0.1
                }
                wx.startGyroscope({
                    interval: 'ui',
                    success() {
                        wx.onGyroscopeChange(s)
                    }
                })

                console.log(this.scene)

            }


        },


    }
})