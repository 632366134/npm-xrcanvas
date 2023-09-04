const STATE = {
    NONE: -1,
    MOVE: 0,
    ZOOM_OR_PAN: 1
}
let prevValue;
import {
    arRawDataToRGB
} from './yuv'
import './remove-black';
import {
    homeRecognizeYUV
} from '../utils/utils'
Component({
    properties: {
        gltfListRaw: {
            type: Array,
            default: []
        },
        videoListRaw: {
            type: Array,
            default: []
        },
        obsListRaw: {
            type: Array,
            default: []
        },
        keyframeListRaw: {
            type: Array,
            default: []
        },
        imageListRaw: {
            type: Array,
            default: []
        }
    },
    observers: {
        gltfListRaw(newVal) {
            this.setData({
                gltfList: newVal,
            })
        },
        videoListRaw(newVal) {
            this.setData({
                videoList: newVal,
            })
        },
        obsListRaw(newVal) {
            this.setData({
                obsList: newVal,
            })
        },
        keyframeListRaw(newVal) {
            this.setData({
                keyframeList: newVal,
            })
        },
        imageListRaw(newVal) {
            this.setData({
                imageList: newVal,
            })
        }
    },

    data: {
        loaded: false,
        arReady: false,
        gltfFlag: false
    },
    lifetimes: {
        attached() {
            console.log(this.width)
            console.log('data', this.data)
        },
        detached() {
            if (this.data.videoList && this.data.videoList.length > 0) {
                const scene = this.scene
                this.data.videoList.map((i) => {
                    // 释放加载过的资源
                    scene.assets.releaseAsset('video-texture', `${i.projectCode}`);
                    scene.assets.releaseAsset('material', `${i.id}-video-mat`);
                })
            }
            if (this.data.gltfList && this.data.gltfList.length > 0) {
                const scene = this.scene


                this.data.gltfList.map((v) => {
                    // 释放加载过的资源
                    scene.assets.releaseAsset('gltf', `gltf-${v.id}`);
                })
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
        createComparator(value) {
            const mesh = this.scene.getElementById(value)

            if (prevValue === undefined) {
                prevValue = value;
                const shape = mesh.addComponent(this.xrFrameSystem.CubeShape, {
                    autoFit: true
                })
            }

            if (prevValue === value) {
                return
            } else {
                const shape = mesh.addComponent(this.xrFrameSystem.CubeShape, {
                    autoFit: true
                })
                const Oldmesh = this.scene.getElementById(prevValue)
                Oldmesh.removeComponent(this.xrFrameSystem.CubeShape)
                prevValue = value;
            }
        },
        goPriview({
            currentTarget
        }) {
            // this.triggerEvent("modalFlagTap", {
            //     data: currentTarget.dataset.item
            // })
        },
        handleTrackerSwitch({
            detail
        }) {
            console.log('tracked match', detail)
            const active = detail.value;
            const element = detail.el;
            const obsList = this.data.obsList
            const gltfList = this.data.gltfList
            obsList.forEach(async i => {
                const markerInfo = i;
                const markerTracker = this.scene.getElementById(`marker-${markerInfo.projectCode}`)

                if (element === markerTracker) {

                    if (active) {
                        const {
                            rgbArray,
                            width,
                            height
                        } = await arRawDataToRGB(this.scene)
                        console.log(rgbArray, 'rgbArray')

                        const a = await homeRecognizeYUV({
                            rgb_array: rgbArray,
                            width,
                            height
                        })
                        console.log(a)
                        const gltfId = this.data.gltfList.filter(v => {
                            return v.projectCode === markerInfo.projectCode
                        })
                        console.log(gltfId)
                        this.createComparator(markerInfo.projectCode)
                        const video = this.video = this.scene.assets.getAsset('video-texture', markerInfo.projectCode);
                        this.videoTRS = this.scene.getElementById(`videoNode-${markerInfo.projectCode}`)?.getComponent(this.xrFrameSystem.Transform)
                        console.log(markerInfo.projectCode, this.videoTRS, video, '123')
                        if (this.videoTRS && video) {
                            console.log('havevideo')
                            const d = video.width / video.height
                            this.videoTRS.scale.x = 1 * d

                            video && video.play()
                        }
                        this.gltfItemTRS = this.scene.getElementById(`gltfNode-${markerInfo.projectCode}`)?.getComponent(this.xrFrameSystem.Transform)
                        this.gltfItemSubTRS = this.scene.getElementById(markerInfo.projectCode)?.getComponent(this.xrFrameSystem.Transform)
                        this.gltfAnim = this.scene.getElementById(markerInfo.projectCode)?.getComponent(this.xrFrameSystem.Animator)

                        // 开启旋转缩放逻辑
                        if (this.gltfItemTRS) {
                            this.scene.event.addOnce('touchstart', this.handleTouchStart)

                        }
                        if (this.data.keyframeList.length > 0) {
                            this.data.keyframeList.forEach(async (obj, index) => {
                                if (obj.parentId === gltfId[0].id) {
                                    this.AnimatorKeyId = this.scene.getElementById(`keyframe-${gltfId[0].id}`)
                                    this.AnimatorKey = this.AnimatorKeyId.getComponent(this.xrFrameSystem.Animator)
                                    await this.AnimatorKey.play(obj.name)
                                    await this.addGltfAnim()


                                }
                            });
                        } else {
                            await addGltfAnim()
                        }

                    } else {
                        this.video && this.video.pause()
                        this.setData({
                            gltfFlag: false
                        })
                        if (this.gltfAnim?.stop !== undefined) {
                            this.gltfAnim.stop()

                        }
                    }

                }

            })

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
            console.log('arReady', detail);
            // this.setData({
            //     arReady: true
            // })
        },
    }
})