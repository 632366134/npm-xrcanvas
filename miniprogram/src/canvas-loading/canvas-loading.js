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
        // async textListRaw(newVal) {
        //     console.log(newVal)
        //     if (Object.keys(newVal).length === 0) return
        //     await xrframe.replaceMaterial(this.scene, newVal, undefined, undefined, this)
        //     // if (!this.scene) {
        //     //     oldVal = newVal
        //     //     this.loaded = false
        //     //     return
        //     // } else {
        //     //     this.loaded = true
        //     //     if (oldVal !== []) {
        //     //         const r = newVal.filter(obj1 => !oldVal.some(obj2 => obj2.text === obj1.text));
        //     //         r.forEach(v => {
        //     //             this.markerShadow.removeChild(this.scene.getElementById(v.file_uid))
        //     //         })
        //     //         this.typeOneLoading(r)
        //     //         oldVal = newVal
        //     //     } else {
        //     //         this.typeOneLoading(newVal)
        //     //         oldVal = newVal
        //     //     }

        //     // }

        // },
        // async screenListRaw(newVal) {
        //     console.log(newVal)

        //     if (Object.keys(newVal).length === 0) return
        //     await xrframe.replaceMaterial(this.scene, newVal, undefined, this.textList, this)
        //     // if (!this.scene) {
        //     //     oldVal = newVal
        //     //     this.loaded = false
        //     //     return
        //     // } else {
        //     //     this.loaded = true
        //     //     if (oldVal !== []) {
        //     //         const r = newVal.filter(obj1 => !oldVal.some(obj2 => obj2.file_url === obj1.file_url));
        //     //         r.forEach(v => {
        //     //             this.markerShadow.removeChild(this.scene.getElementById(v.file_uid))
        //     //         })
        //     //         this.typeOneLoading(r)
        //     //         oldVal = newVal
        //     //     } else {
        //     //         this.typeOneLoading(newVal)
        //     //         oldVal = newVal
        //     //     }

        //     // }

        // }
    },

    /**
     * 组件的初始数据
     */
    data: {
        readyFlag: true,
        Assetsloaded: false,
        targetFlag: false
    },
    lifetimes: {

        async attached() {
            this.textList = []
            this.animatorList = []
            this.videoList = []
        },
        async detached() {
            await xrframe.stopAnimatorAndVideo(this,true)
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
            await xrframe.replaceMaterial(this.scene, data, undefined, undefined, this)
        },
        async setDefaultObjectsData(list, template_type) {
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            this.triggerEvent('handleAssetsLoaded', {
                handleAssetsLoaded: false,
            },{
                composed: true,
                capturePhase: false,
                bubbles: true
            })
            if (template_type === "模版四") {
                this.markerShadow.getComponent(this.XR.Transform).rotation.x = 30 * (Math.PI / 180)
                this.camera.getComponent(this.XR.Camera).setData({
                    target: this.markerShadow.getComponent(this.XR.Transform)
                })
                this.camera.addComponent(this.XR.CameraOrbitControl, {});
            }
          
            this.i = 1
            this.list = list
            // const list = this.list = await xrframe.concatArrayToObjects(p_ar, true)
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
                    await xrframe.handleShadowRotate(this,template_type)
                }
                await xrframe.addTemplateTextAnimator(template_type, this.scene, this)
                await xrframe.startAnimatorAndVideo(this)
                this.triggerEvent('handleAssetsLoaded', {
                    handleAssetsLoaded: true,
                },{
                    composed: true,
                    capturePhase: false,
                    bubbles: true
                })
                wx.hideLoading()

            })
        },
        async concatArrayToObjects(p_ar, flag) {
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
            return await xrframe.saveSceneAsImage(this.scene)
        },
        resetPosition(type) {
            if (type === "模版四") {
                xrframe.resetPosition(this.camera, type)

            } else {
                xrframe.resetPosition(this.markerShadow, type)

            }
        }
    },

})