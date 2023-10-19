// src/canvasLoading/canvasLoading.ts
import * as xrframe from '../xr-canvas/xrframe'
let oldVal = []
Component({

    /**
     * 组件的属性列表
     */
    properties: {

        workflowType: {
            type: Number,
            default: null
        },

    },
    observers: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        readyFlag: true,
        Assetsloaded: false,
        targetFlag: false,
        touch: {
            pageX: 0,
            pageY: 0
        },
        cameraPosition: [0, 0, -5],
        targetPosition: [0, 0, 0]

    },
    lifetimes: {

        async attached() {
            this.textList = []
            this.animatorList = []
            this.videoList = []
        },
        async detached() {
            xrframe.releaseAssetList(this.scene, this.list)
            await xrframe.stopAnimatorAndVideo(this, true)
            this.innerAudioContext2?.stop()
            this.innerAudioContext2?.destroy()
            this.innerAudioContext2 = null
            if (this.timer2) {
                clearTimeout(this.timer2)
            }
            if (this.timer1) {
                clearTimeout(this.timer1)
            }
            if (this.scene) {
                this.scene = null
            }
        },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        async replaceMaterial(data) {
            await xrframe.replaceMaterial(this.scene, data, undefined, true, this)
            if (this.template_type === "模版二") {
                await xrframe.addTemplateTextAnimator(this.template_type, this.scene, this)
            }
            // await xrframe.stopAnimatorAndVideo(this, false)
            // await xrframe.startAnimatorAndVideo(this)
        },
        async setDefaultObjectsData(list, template_type) {
            this.template_type = template_type
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            if (template_type === '模版四') {
                this.camera.addComponent(this.XR.CameraOrbitControl, {});
            }
            this.setData({
                cameraPosition: xrframe.cameraPosition[template_type],
                targetPosition: xrframe.targetPosition[template_type]
            })


            this.triggerEvent('handleAssetsLoaded', {
                handleAssetsLoaded: false,
            }, {
                composed: true,
                capturePhase: false,
                bubbles: true
            })
            this.i = 2
            this.list = list
            if (list.length === 0) return
            const promiseList = []
            await xrframe.loadENVObject(this.scene, this)

            for (const obj of list) {
                if (obj.type === 'text') {
                    const p = xrframe.loadImageObject(this.scene, obj, this.markerShadow, true, this)
                    promiseList.push(p)

                } else if (obj.type === "model") {
                    const p = xrframe.loadModelObject(this.scene, obj, true, this.markerShadow, this)
                    promiseList.push(p)

                } else if (obj.type === 'video') {
                    const p = xrframe.loadVideoObject(this.scene, obj, true, this.markerShadow, this)

                } else if (obj.type === 'screen' && template_type === "模版四") {
                    const p = xrframe.loadImageObject(this.scene, obj, this.markerShadow2, true, this)
                    promiseList.push(p)
                } else if (obj.type === 'screen') {
                    const p = xrframe.loadImageObject(this.scene, obj, this.markerShadow, true, this)
                    promiseList.push(p)
                } else if (obj.type === 'image') {
                    const p = xrframe.loadImageObject(this.scene, obj, this.markerShadow, true, this)
                    promiseList.push(p)
                }
            }
            await Promise.all(promiseList).then(async results => {
                this.data.Assetsloaded = true
                if (template_type !== "模版四") {
                    await xrframe.handleShadowRotate(this, template_type)
                }
                if (template_type === "模版二") {
                    await xrframe.addTemplateTextAnimator(template_type, this.scene, this)
                }
                xrframe.startAnimatorAndVideo(this)
                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: true,
                }, {
                    composed: true,
                    capturePhase: false,
                    bubbles: true
                })
                wx.hideLoading()

            })
        },
        async addToScene(list, template_type) {

            let animatorList2 = this.animatorList.filter(v => v.name !== "animate")
            this.animatorList = animatorList2


            this.template_type = template_type
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            this.list = list
            if (list.length === 0) return
            const promiseList = []
            for (const obj of list) {
                if (obj.type === 'text') {
                    const p = xrframe.loadImageObject(this.scene, obj, this.markerShadow, true, this)
                    promiseList.push(p)

                } else if (obj.type === "model") {
                    const p = xrframe.loadModelObject(this.scene, obj, true, this.markerShadow, this)
                    promiseList.push(p)

                } else if (obj.type === 'video') {
                    const p = xrframe.loadVideoObject(this.scene, obj, true, this.markerShadow, this)
                    promiseList.push(p)

                } else if (obj.type === 'screen' && template_type === "模版四") {
                    const p = xrframe.loadImageObject(this.scene, obj, this.markerShadow2, true, this)
                    promiseList.push(p)
                } else if (obj.type === 'screen') {
                    const p = xrframe.loadImageObject(this.scene, obj, this.markerShadow, true, this)
                    promiseList.push(p)
                } else if (obj.type === 'image') {
                    const p = xrframe.loadImageObject(this.scene, obj, this.markerShadow, true, this)
                    promiseList.push(p)
                }
            }
            await Promise.all(promiseList).then(async results => {
                this.data.Assetsloaded = true
                if (template_type !== "模版四") {
                    await xrframe.handleShadowRotate(this, template_type)
                }
                // if (template_type === "模版二") {
                await xrframe.addTemplateTextAnimator(template_type, this.scene, this)
                // }
                await xrframe.stopAnimatorAndVideo(this, false)
                xrframe.startAnimatorAndVideo(this)
                wx.hideLoading()

            })
        },
        async concatArrayToObjects({
            p_ar
        }, flag) {
            this.result = p_ar
            return await xrframe.concatArrayToObjects(p_ar, flag)
        },
        async handleReady({
            detail
        }) {
            const xrScene = this.scene = detail.value;
            const markerShadow = this.markerShadow = this.scene.getElementById('markerShadow')
            const markerShadow2 = this.markerShadow2 = this.scene.getElementById('markerShadow2')
            const camera = this.camera = this.scene.getElementById('camera')


            this.XR = wx.getXrFrameSystem();
            this.triggerEvent('handleReady', {}, {
                composed: true,
                capturePhase: false,
                bubbles: true
            })
        },
        removeFromScene(uid) {
            xrframe.removeFromScene(this.markerShadow, this.markerShadow2, this.scene.getElementById(uid))
        },
        async saveSceneAsImage() {
            xrframe.pauseAnimatorAndVideo(this, 0.99)
            const result = await xrframe.saveSceneAsImage(this.scene)
            await xrframe.resumeAnimatorAndVideo(this)
            return result
        },
        resetPosition(type) {
            if (type === "模版四") {
                xrframe.resetPosition(this.camera, type)

            } else {
                xrframe.resetPosition(this.markerShadow, type)

            }
        },
        hideChildVisible(uid) {
            const element = this.scene.getElementById(uid).getComponent(this.XR.Transform)
            element.setData({
                visible: false
            })
        }
    },

})