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
            type: Array,
            default: []
        },
        screenListRaw: {
            type: Array,
            default: []
        }
    },
    observers: {
        async textListRaw(newVal) {
            if (newVal.length !== 0) {
                if (!this.scene) {
                    oldVal = newVal
                    this.loaded = false
                    return
                } else {
                    this.loaded = true
                    if (oldVal !== []) {
                        const r = newVal.filter(obj1 => !oldVal.some(obj2 => obj2.text === obj1.text));
                        r.forEach(v => {
                            this.markerShadow.removeChild(this.scene.getElementById(v.file_uid))
                        })
                        this.typeOneLoading(r)
                        oldVal = newVal
                    } else {
                        this.typeOneLoading(newVal)
                        oldVal = newVal
                    }

                }
            }

        },
        async screenListRaw(newVal) {
            console.log(newVal, 'newValnewValnewValnewVal')
            if (newVal.length !== 0) {
                if (!this.scene) {
                    oldVal = newVal
                    this.loaded = false
                    return
                } else {
                    this.loaded = true
                    if (oldVal !== []) {
                        const r = newVal.filter(obj1 => !oldVal.some(obj2 => obj2.file_url === obj1.file_url));
                        r.forEach(v => {
                            this.markerShadow.removeChild(this.scene.getElementById(v.file_uid))
                        })
                        this.typeOneLoading(r)
                        oldVal = newVal
                    } else {
                        this.typeOneLoading(newVal)
                        oldVal = newVal
                    }

                }
            }

        }
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
            console.log('detacheddetacheddetached',this.list)
            if (this.list?.length >= 0) {
                xrframe.releaseAssetList(this, this.list)
                this.list =[]
            }
            this.triggerEvent('bgc_AudioFlagChange', {
                bgc_AudioFlag: false
            })
            this.innerAudioContext2?.stop()
            this.innerAudioContext2?.destroy()
            this.innerAudioContext2 = null
            if (this.x) {
                this.x = null
                wx.offGyroscopeChange(this.x)
                wx.stopGyroscope()
            }
            if(this.timer2){
                clearTimeout(this.timer2)
            }
            if(this.timer1){
                clearTimeout(this.timer1)
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
    /**
     * 组件的方法列表
     */
    methods: {
        async typeOneLoading(textListRaw) {
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            let promiseList = []
            for (let item of textListRaw || []) {
                if (!item.file_url) continue;
                if (!item.uid) item.uid = xrframe.uuid();
                item.type = "text";
                const p = xrframe.loadImageObject(this.scene, item, this.markerShadow, true, this)
                promiseList.push(p)


            }
            await Promise.all(promiseList)
            await xrframe.handleShadowRotate(this)
            await xrframe.startAnimatorAndVideo(this)
            wx.hideLoading()

        },

        async handleReady({
            detail
        }) {
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            this.nodeList = []
            this.triggerEvent('handleReady')
            const xrScene = this.scene = detail.value;
            this.XR = wx.getXrFrameSystem();
            const markerShadow = this.markerShadow = this.scene.getElementById('markerShadow')
            const {
                p_ar
            } = this.data.p_arData
            this.i=1
            const list = this.list = await xrframe.concatArrayToObjects(p_ar, true)
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
                this.data.Assetsloaded = true
                // await xrframe.addTemplateTextAnimator(p_ar.template_type, this.scene, this)
                if (this.loaded) return
                if (this.data.textListRaw !== []) {
                    await this.typeOneLoading(this.data.textListRaw)

                }
                if (this.data.screenListRaw !== []) {
                    await this.typeOneLoading(this.data.screenListRaw)
                }

                //  await xrframe.startAnimatorAndVideo(this)
            })
        }
    }
})