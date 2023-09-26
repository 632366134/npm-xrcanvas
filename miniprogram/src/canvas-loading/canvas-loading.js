// src/canvasLoading/canvasLoading.ts
import * as xrframe from '../xr-canvas/xrframe'
let oldVal = []
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        p_arData: {
            type: Object,
            default: {}
        },
        workflowData: {
            type: Object,
            default: {}

        },
        workflowType: {
            type: Number,
            default: null
        },
        textListRaw: {
            type: Object,
            default: {}
        },
        screenListRaw: {
            type: Object,
            default: {}
        }
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
        Assetsloaded: false
    },
    lifetimes: {

        async attached() {
            this.textList = []
            this.animatorList = []
            this.videoList = []
        },
        detached() {
            this.triggerEvent('bgc_AudioFlagChange', {
                bgc_AudioFlag: false
            })
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
        async setDefaultObjectsData(list) {
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            // const {
            //     p_ar
            // } = data
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

                } else if (obj.type === 'screen' && this.data.p_arData.p_ar.template_type === "模版四") {
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
                // await xrframe.addTemplateTextAnimator(p_ar.template_type, this.scene, this)
                // if (this.loaded) return
                // if (this.data.textListRaw !== []) {
                //     await this.typeOneLoading(this.data.textListRaw)

                // }
                // if (this.data.screenListRaw !== []) {
                //     await this.typeOneLoading(this.data.screenListRaw)
                // }
                await xrframe.handleShadowRotate(this)
                await xrframe.startAnimatorAndVideo(this)
                wx.hideLoading()

            })
        },
        // async typeOneLoading(textListRaw) {
        //     wx.showLoading({
        //         title: '加载中',
        //         mask: true
        //     })
        //     let promiseList = []
        //     for (let item of textListRaw || []) {
        //         if (!item.file_url) continue;
        //         if (!item.uid) item.uid = xrframe.uuid();
        //         item.type = "text";
        //         const p = xrframe.loadImageObject(this.scene, item, this.markerShadow, true, this)
        //         promiseList.push(p)


        //     }
        //     await Promise.all(promiseList)
        //     await xrframe.handleShadowRotate(this)
        //     await xrframe.startAnimatorAndVideo(this)
        //     wx.hideLoading()

        // },

        async handleReady({
            detail
        }) {
            const xrScene = this.scene = detail.value;
            const markerShadow = this.markerShadow = this.scene.getElementById('markerShadow')
            const markerShadow2 = this.markerShadow2 = this.scene.getElementById('markerShadow2')
            this.nodeList = []

            this.XR = wx.getXrFrameSystem();
            this.triggerEvent('handleReadyFun', {}, {
                composed: true,
                capturePhase: true,
                bubbles: true
            })
        },
        removeFromScene(uid) {
            xrframe.removeFromScene(this.markerShadow, this.markerShadow2, uid)
        },
        async saveSceneAsImage() {
            return await xrframe.saveSceneAsImage(this.scene)
        },
        resetPosition() {
            xrframe.resetPosition(this.markerShadow)
        }
    },
   
})