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
        }
    },
    observers: {

        obsListRaw(newVal) {
            this.setData({
                obsList: newVal,
            })
        }

    },

    data: {
        loaded: false,
        arReady: false,
        gltfFlag: false,
        animatorList: [],
        videoList: []
    },
    lifetimes: {
        attached() {
            console.log('data', this.data)
        },
        async detached() {
            if (this.list.length !== 0) {
                for (const obj of list) {
                    if (obj.type === 'text') {

                    } else if (obj.type === "model") {
                        await this.scene.assets.releaseAsset('gltf', obj.uid);

                    } else if (obj.type === 'video') {
                        await this.scene.assets.releaseAsset('video-texture', obj.uid);


                    } else if (obj.type === 'screen') {

                    } else if (obj.type === 'image') {
                        await this.scene.assets.releaseAsset('texture', obj.uid);


                    }

                }
                this.list = null
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
        // createComparator(value) {
        //     const mesh = this.scene.getElementById(value)

        //     if (prevValue === undefined) {
        //         prevValue = value;
        //         const shape = mesh.addComponent(this.xrFrameSystem.CubeShape, {
        //             autoFit: true
        //         })
        //     }

        //     if (prevValue === value) {
        //         return
        //     } else {
        //         const shape = mesh.addComponent(this.xrFrameSystem.CubeShape, {
        //             autoFit: true
        //         })
        //         const Oldmesh = this.scene.getElementById(prevValue)
        //         Oldmesh.removeComponent(this.xrFrameSystem.CubeShape)
        //         prevValue = value;
        //     }
        // },
        // goPriview({
        //     currentTarget
        // }) {
        //     // this.triggerEvent("modalFlagTap", {
        //     //     data: currentTarget.dataset.item
        //     // })
        // },
        async handleTrackerSwitch({
            detail
        }) {
            console.log('tracked match', detail)
            const active = detail.value;
            const element = detail.el;
            const screenNode = this.screenNode = this.scene.getElementById('markerShadow')
            this.triggerEvent('handleTrackerSwitch', active)
            if (active) {
                const debouncedFetchData = await xrframe.throttle(() => xrframe.recognizeCigarette(this.scene), 1000, this); // 300 毫秒的防抖延迟
                console.log(debouncedFetchData, 'debouncedFetchData')
                let result = await debouncedFetchData()
                console.log(result, 'result')

                result = jsonData.result.p_ar
                const list = this.list = await xrframe.concatArrayToObjects(result, true)
                console.log(list, 'list')
                if (list.length === 0) return

                for (const obj of list) {
                    if (obj.type === 'text') {

                    } else if (obj.type === "model") {
                        await xrframe.loadModelObject(this.scene, obj, this.data.animatorList, screenNode)

                    } else if (obj.type === 'video') {
                        await xrframe.loadVideoObject(this.scene, obj, this.data.videoList, screenNode)

                    } else if (obj.type === 'screen') {

                    } else if (obj.type === 'image') {
                        await xrframe.loadImageObject(this.scene, obj, screenNode, this.data.textList, this)

                    }

                }
            this.triggerEvent('handleAssetsLoaded')

                await xrframe.addTemplateTextAnimator(list.template_type, this.scene, this.data.textList, this.data.animatorList)
                await this.startAnimatorAndVideo()
                await xrframe.handleShadowRotate(this)

            } else {
                await this.stopAnimatorAndVideo()
            }

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
            const {
                width,
                height
            } = this.scene
            // 旋转缩放相关配置
            this.radius = (width + height) / 4
            this.rotateSpeed = 5

            this.handleTouchStart = (event) => {
                    this.mouseInfo = {
                        startX: 0,
                        startY: 0,
                        isDown: false,
                        startPointerDistance: 0,
                        state: STATE.NONE
                    }
                    this.mouseInfo.isDown = true

                    const touch0 = event.touches[0]
                    const touch1 = event.touches[1]

                    if (event.touches.length === 1) {
                        this.mouseInfo.startX = touch0.pageX
                        this.mouseInfo.startY = touch0.pageY
                        this.mouseInfo.state = STATE.MOVE
                    } else if (event.touches.length === 2) {
                        const dx = (touch0.pageX - touch1.pageX)
                        const dy = (touch0.pageY - touch1.pageY)
                        this.mouseInfo.startPointerDistance = Math.sqrt(dx * dx + dy * dy)
                        this.mouseInfo.startX = (touch0.pageX + touch1.pageX) / 2
                        this.mouseInfo.startY = (touch0.pageY + touch1.pageY) / 2
                        this.mouseInfo.state = STATE.ZOOM_OR_PAN
                    }

                    this.scene.event.add('touchmove', this.handleTouchMove.bind(this))
                    this.scene.event.addOnce('touchend', this.handleTouchEnd.bind(this))

                },
                this.handleTouchMove = (event) => {
                    const mouseInfo = this.mouseInfo
                    if (!mouseInfo.isDown) {
                        return
                    }

                    switch (mouseInfo.state) {
                        case STATE.MOVE:
                            if (event.touches.length === 1) {
                                this.handleRotate(event)
                            } else if (event.touches.length === 2) {
                                // 支持单指变双指，兼容双指操作但是两根手指触屏时间不一致的情况
                                this.scene.event.remove('touchmove', this.handleTouchMove)
                                this.scene.event.remove('touchend', this.handleTouchEnd)
                                this.handleTouchStart(event)
                            }
                            break
                        case STATE.ZOOM_OR_PAN:
                            if (event.touches.length === 1) {
                                // 感觉双指松掉一指的行为还是不要自动切换成旋转了，实际操作有点奇怪
                            } else if (event.touches.length === 2) {
                                this.handleZoomOrPan(event)
                            }
                            break
                        default:
                            break
                    }
                }

            this.handleTouchEnd = (event) => {
                this.mouseInfo.isDown = false
                this.mouseInfo.state = STATE.NONE

                this.scene.event.remove('touchmove', this.handleTouchMove)
                this.scene.event.addOnce('touchstart', this.handleTouchStart)
            }

            this.handleRotate = (event) => {
                const x = event.touches[0].pageX
                const y = event.touches[0].pageY

                const {
                    startX,
                    startY
                } = this.mouseInfo

                const theta = (x - startX) / this.radius * -this.rotateSpeed
                const phi = (y - startY) / this.radius * -this.rotateSpeed
                if (Math.abs(theta) < .01 && Math.abs(phi) < .01) {
                    return
                }
                this.gltfItemTRS.rotation.x -= phi
                this.gltfItemSubTRS.rotation.z += theta
                this.mouseInfo.startX = x
                this.mouseInfo.startY = y
            }

            this.handleZoomOrPan = (event) => {
                const touch0 = event.touches[0]
                const touch1 = event.touches[1]

                const dx = (touch0.pageX - touch1.pageX)
                const dy = (touch0.pageY - touch1.pageY)
                const distance = Math.sqrt(dx * dx + dy * dy)

                let deltaScale = distance - this.mouseInfo.startPointerDistance
                this.mouseInfo.startPointerDistance = distance
                this.mouseInfo.startX = (touch0.pageX + touch1.pageX) / 2
                this.mouseInfo.startY = (touch0.pageY + touch1.pageY) / 2
                if (deltaScale < -2) {
                    deltaScale = -2
                } else if (deltaScale > 2) {
                    deltaScale = 2
                }

                const s = deltaScale * 0.02 + 1
                // 缩小
                this.gltfItemTRS.scale.x *= s
                this.gltfItemTRS.scale.y *= s
                this.gltfItemTRS.scale.z *= s


            }
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
            this.setData({
                arReady: true
            })
        },
        handleARReady: function ({
            detail
        }) {
            this.triggerEvent('handleARReady')

            console.log('arReady', detail);
            // this.setData({
            //     arReady: true
            // })
        },
    }
})