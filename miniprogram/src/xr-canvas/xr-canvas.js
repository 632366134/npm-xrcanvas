const STATE = {
    NONE: -1,
    MOVE: 0,
    ZOOM_OR_PAN: 1
}
let prevValue;
import './remove-black';
import jsonData from './test'
import * as xrframe from './xrframe'
Component({
    properties: {

        obsListRaw: {
            type: Array,
            default: []
        },
        type1: {
            type: String,
            default: ''
        }
    },
    observers: {

        obsListRaw(newVal) {
            this.setData({
                obsList: newVal,
            })
        },
        type1(newVal) {
            if (newVal === '2') {
                this.setData({
                    type2: newVal,
                    trackerFlag: false
                })
            } else {
                this.setData({
                    type2: newVal,
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
        trackerFlag: false,
        type2: ''
    },
    lifetimes: {
        async attached() {
            this.textList = []
            this.animatorList = []
            this.videoList = []

            if (this.data.type === '2') {

            }
        },
        detached() {
            xrframe.releaseAssetList(this, this.list)
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
                await this.startAnimatorAndVideo()
                timer = setTimeout(() => {
                    this.triggerEvent('stayPage')
                }, this.stay_duration);
            } else {
                clearTimeout(timer)
                await this.stopAnimatorAndVideo()
            }

        },
        async concatAndLoadAssets(result) {
            this.triggerEvent('handleAssetsLoaded', {
                handleAssetsLoaded: false,
            })
            this.setData({
                trackerFlag: true,
            })
            const markerShadow = this.markerShadow = this.scene.getElementById('markerShadow')
            // const markerShadow=this.markerShadow = this.scene.createElement(this.xrFrameSystem.XRNode);
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

            Promise.all(promiseList).then(async results => {
                console.log(results, 'handleAssetsLoadedtrue')
                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: true,

                })

                await xrframe.addTemplateTextAnimator(result.template_type, this.scene, this)
                await xrframe.handleShadowRotate(this)
                console.log(markerShadow)

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
        async addGltfAnim() {
            if (this.gltfAnim?._clips !== undefined) {
                const clips = this.gltfAnim._clips;
                this.clipName = []

                clips.forEach((v, key) => {
                    this.clipName.push(key)
                })
                if (this.clipName.length != 0) {
                    this.clipName.forEach(i => {
                        this.gltfAnim.play(i, {
                            loop: -1,
                        });
                    })
                }

            }

            await this.setData({
                gltfFlag: true
            })
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
            const {
                p_ar
            } = await xrframe.recognizeCigarette(this.scene)
            const {
                front_image_url,
                front_image_uid,
                back_image_url,
                back_image_uid
            } = p_ar.cigarette
            this.stay_duration = p_ar
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

        },


    }
})