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
                console.log(element)
                element.addChild(this.screenNode)
                // const debouncedFetchData = await xrframe.throttle(() => xrframe.recognizeCigarette(this.scene), 1000, this); // 300 毫秒的防抖延迟
                // console.log(debouncedFetchData, 'debouncedFetchData')
                // let result = await debouncedFetchData()
                // console.log(result, 'result')
                // try {
                //     await this.concatAndLoadAssets(result)
                //     if (list.p_ending?.length === 0) return
                //     timer = setTimeout(() => {
                //         this.triggerEvent('lastShowChange', {
                //             lastShow: true
                //         })
                //     }, 6000);
                // } catch (error) {
                //     this.triggerEvent('loadError', {
                //         loadError: error
                //     })

                // }


            } else {
                await this.stopAnimatorAndVideo()
            }

        },
        async concatAndLoadAssets(result) {
            this.triggerEvent('handleAssetsLoaded', {
                handleAssetsLoaded: false,
            })
            // const screenNode = this.screenNode = this.scene.getElementById('markerShadow')
            const screenNode=this.screenNode = this.scene.createElement(this.xrFrameSystem.XRNode);
            const list = this.list = await xrframe.concatArrayToObjects(result, true)
            console.log(list, 'list', screenNode)
            if (list.length === 0) return
            const promiseList = []
            for (const obj of list) {
                if (obj.type === 'text') {
                    const p = xrframe.loadImageObject(this.scene, obj, screenNode, this.data.textList, this)
                    promiseList.push(p)

                } else if (obj.type === "model") {
                    const p = xrframe.loadModelObject(this.scene, obj, this.data.animatorList, screenNode)
                    promiseList.push(p)

                } else if (obj.type === 'video') {
                    const p = xrframe.loadVideoObject(this.scene, obj, this.data.videoList, screenNode)

                } else if (obj.type === 'screen') {
                    const p = xrframe.loadImageObject(this.scene, obj, screenNode, this.data.textList, this)
                    promiseList.push(p)
                } else if (obj.type === 'image') {
                    const p = xrframe.loadImageObject(this.scene, obj, screenNode, this.data.textList, this)
                    promiseList.push(p)
                }

            }
            Promise.all(promiseList).then(async results => {
                console.log(results, 'handleAssetsLoadedtrue')
                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: true,

                })

                await xrframe.addTemplateTextAnimator('模版一', this.scene, this.data.textList, this.data.animatorList)
                await this.startAnimatorAndVideo()
                await xrframe.handleShadowRotate(this)
                console.log(screenNode)
                this.setData({
                    trackerFlag: true,
                })
            }).catch(err => {
                console.log(err)
            })

        },
        async startAnimatorAndVideo() {
            await xrframe.startAnimatorAndVideo(this.data.animatorList, this.data.videoList)

        },
        async stopAnimatorAndVideo() {
            await xrframe.stopAnimatorAndVideo(this.data.animatorList, this.data.videoList, true)
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