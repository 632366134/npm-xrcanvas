import {
    homeRecognize,
    homeRecognizeYUV
} from '/utils';
import '../components/AutoRotate'
import '../components/transparentVideos'


import * as YUVUtils from './yuv';
import {
    generateTemplate1KeyFrame
} from './template1';
import {
    generateTemplate2KeyFrame
} from "./template2";
import {
    generateTemplate3KeyFrame
} from './template3';
// import {
//     generateTemplate3KeyFrame
// } from './remove-black';
import {
    generateGrowKeyFrame
} from './grow';

const FSM = wx.getFileSystemManager();
let i = 0
const XRFrameSystem = wx.getXrFrameSystem();
export const getCameraAuthorize = () => {
    return new Promise((resolve) => {
        wx.authorize({
            scope: 'scope.camera',
            success: (res) => {
                resolve(true);
            },
            fail: (err) => {
                wx.showModal({
                    title: '提示',
                    content: '请开启相机权限',
                    complete: (res) => {
                        if (res.confirm) {
                            wx.openSetting({
                                success: (res) => {
                                    resolve(res.authSetting['scope.camera']);
                                }
                            });
                        } else {
                            resolve(false);
                        }
                    }
                });
            }
        });
    });
}

export const handleXRSupport = (that) => {
    let xrSupport = handleXRCompatibility();
    if (xrSupport !== true) {
        that.setData({
            unSupport: xrSupport,
        });
        return false
    } else {
        // if (that.data.workflowType === 2) return
        // that.setData({
        //     xrShow: true,
        // });
        return true

    }
}

export const initXRFrame = (that, width, height) => {
    const {
        windowWidth: windowWidth,
        windowHeight: windowHeight,
        pixelRatio: dpi,
    } = wx.getSystemInfoSync();

    that.setData({
        "width": width || windowWidth,
        "height": height || windowHeight,
        "renderWidth": width ? width * dpi : windowWidth * dpi,
        "renderHeight": height ? height * dpi : windowHeight * dpi,
    });
}

export const handleXRCompatibility = () => {
    const notSupportedList = ['iPhone 12/13 (Pro)'];
    const lowestVersion = {
        iOS: '8.0.36',
        Android: '8.0.35',
        SDK: '3.0.0'
    };
    const info = wx.getSystemInfoSync();
    const systemType = info.system.split(' ')[0];
    console.log(`XR-FRAME兼容处理\n设备型号: ${info.model}\nSDK版本: ${info.SDKVersion}\n微信版本: ${info.version}`);
    const isNotSupported = {
        device: isNotSupportedDevice(info.model),
        SDKVersion: isVersionTooLow(info.SDKVersion, lowestVersion.SDK),
        version: isVersionTooLow(info.version, lowestVersion[systemType]),
    };
    if (isNotSupported.device) return '此设备暂不支持AR功能';
    if (isNotSupported.SDKVersion) return `请更新微信基础库，最低支持 ${lowestVersion.SDK}`;
    if (!lowestVersion[systemType]) return `暂不支持${systemType}平台设备`;
    if (isNotSupported.version) return `请更新微信版本，最低支持 ${lowestVersion[systemType]}`;
    return true;

    function isNotSupportedDevice(model) {
        return notSupportedList.some((device) => model.includes(device));
    }

    function isVersionTooLow(version1, version2) {
        const version1Arr = version1.split('.').map(Number);
        const version2Arr = version2.split('.').map(Number);
        const maxLength = Math.max(version1Arr.length, version2Arr.length);
        for (let i = 0; i < maxLength; i++) {
            const num1 = version1Arr[i] || 0;
            const num2 = version2Arr[i] || 0;
            if (num1 > num2) return false;
            if (num1 < num2) return true;
        }
        return false;
    }
}

export const audioFadeOut = (audioContext) => {
    return new Promise(resolve => {
        let volume = audioContext.volume;
        const decrement = volume;
        const interval = 50;
        const steps = 20;
        let count = 0;
        const timer = setInterval(async () => {
            if (count < steps) {
                volume = volume - decrement / steps;
                audioContext.volume = volume;
                count++;
            } else {
                audioContext.stop();
                audioContext.destroy();
                resolve(clearInterval(timer));
            }
        }, interval);
    });
}

export const saveSceneAsImage = async (scene) => {
    let base64 = await scene.share.captureToDataURLAsync({
        type: 'jpg',
        quality: 0.8
    });
    const ImagePath = `${wx.env.USER_DATA_PATH}/scene${i++}.jpg`;
    const ImageData = base64.replace(/^data:image\/\w+;base64,/, "");
    FSM.writeFileSync(ImagePath, ImageData, "base64");
    return ImagePath;
}
export const saveImage = async (scene) => {
    if (!YUVUtils.incompatibleDevice(scene)) {
        let rgbData = YUVUtils.arRawDataToRGB(scene);
        return rgbData
    } else {
        let imagePath = await saveSceneAsImage(scene);
        return imagePath
    }
}

export const recognizeCigarette = (scene, that = null) => {
    return new Promise(async (resolve) => {
        try {
            if (!scene._components) return resolve('break');
            if (!YUVUtils.incompatibleDevice(scene)) {
                let rgbData = YUVUtils.arRawDataToRGB(scene);
                var recognizedResult = await homeRecognizeYUV(rgbData);
            } else {
                let imagePath = await saveSceneAsImage(scene);
                var recognizedResult = await homeRecognize(imagePath);

                recognizedResult = JSON.parse(recognizedResult);
            }
            console.log('XR-FRAME 烟包识别接口', recognizedResult);
            if (recognizedResult.err_code !== 0) throw recognizedResult.err_desc || null;
            const {
                result
            } = recognizedResult
            if (that && that.data.workflowType === 3) {
                if (result.sku === that.data.p_arData.p_ar.cigarette.sku) {
                    // wx.showToast({
                    //     title: '规格匹配成功',
                    //     duration: 1000,
                    //     icon: 'none'
                    // })
                    return resolve(recognizedResult.result);
                } else {
                    wx.showToast({
                        title: '请扫描对应规格烟盒',
                        duration: 1000,
                        icon: 'none'
                    })
                    return resolve(await recognizeCigarette(scene, that))

                }
            }
            if (!!!result.p_ar && !!!result.sku) {
                return resolve(await recognizeCigarette(scene))
            } else if (!!!result.p_ar && !!result.sku) {
                wx.showToast({
                    title: '规格暂无AR效果',
                    duration: 1000,
                    icon: 'none'
                })
                return resolve(await recognizeCigarette(scene))

            } else {
                return resolve(recognizedResult.result);
            }

        } catch (err) {
            console.error('XR-FRAME识别错误', err);
            wx.showToast({
                title: err || '识别服务错误',
                icon: 'error',
                duration: 1000 * 2,
            });
            return resolve(false);
        }
    });
}

export const concatArrayToObjects = (result, showModel) => {
    try {
        let objects = [];
        for (let item of result.text_list || []) {
            if (!item.file_url) continue;
            if (!item.uid) item.uid = uuid();
            item.type = "text";
            objects.push(item);
        }
        for (let item of result.videos || []) {
            if (!item.file_url) continue;
            if (!item.uid) item.uid = uuid();
            item.type = "video";
            objects.push(item);
        }
        for (let item of result.images || []) {
            if (!item.file_url) continue;
            if (!item.uid) item.uid = uuid();
            item.type = "image";
            objects.push(item);
        }
        for (let item of result.transparent_videos || []) {
            if (!item.file_url) continue;
            if (!item.uid) item.uid = uuid();
            item.type = "video";
            item.effect = 'transparentVideo';
            objects.push(item);
        }
        for (let item of result.gltf_list || []) {
            if (!item.file_url) continue;
            if (!item.uid) item.uid = uuid();
            item.type = 'model';
            objects.push(item);
        }
        for (let item of result.screen_list || []) {
            if (!item.file_url) continue;
            let _item = item;
            if (!item.uid) _item.uid = uuid();
            _item.type = 'screen';
            objects.push(_item);
        }
        if (result.model?.file_url && showModel) {
            result.model.type = "model";
            objects.push(result.model);
        }
        return objects;
    } catch (err) {
        console.error('3D素材数据处理错误: ', err);
    }
}
export const loadENVObject = async (scene, that) => {
    try {
        let {
            value: envData
        } = await scene.assets.loadAsset({
            type: 'env-data',
            assetId: 'env1',
            src: backgroundAudioList['xr-env']
        });
        if (!scene) return;
        const node = scene.createElement(XRFrameSystem.XREnv);
        that.scene.addChild(node)
        if (!node) return;
        node.setId('env')

        node.getComponent(XRFrameSystem.Env).setData({
            envData: envData,
        });

        if (!node) return;
        that.triggerEvent('handleAssetsProgress', {
            index: 1,
            length: that.list.length + 1
        }, {
            composed: true,
            capturePhase: false,
            bubbles: true
        })
        return;
    } catch (err) {
        console.error('XR-FRAME env环境数据加载错误: ', err);
    }
}

export const loadModelObject = async (scene, modelData, animatorList, markerShadow, that) => {
    try {
        await scene.assets.releaseAsset('gltf', modelData.uid);

        if (!modelData.file_url) throw '无资源URL';
        let model = await scene.assets.loadAsset({
            type: 'gltf',
            assetId: modelData.uid,
            src: modelData.file_url
        });
        if (!scene) return;
        const node = scene.createElement(XRFrameSystem.XRGLTF);

        if (!node) return;
        node.setId(modelData.uid)

        node.getComponent(XRFrameSystem.GLTF).setData({
            model: model.value,
        });

        if (!node) return;
        node.event.addOnce('gltf-loaded', (detail) => {
            let gltf = detail.target.getComponent('gltf');
            if (gltf._animations.length === 0) return;
            let animator = detail.target.getComponent('animator');
            if (!animatorList) return;
            that.animatorList.push({
                animator: animator,
                name: gltf._animations[0].clipNames[0],
            });
        });
        if (!markerShadow || !node) return;
        await addObjectToShadow(markerShadow, node, modelData['3d_info'], false, that);

        return;
    } catch (err) {
        console.error('XR-FRAME GLTF模型加载错误: ', err);
    }
}

export const loadVideoObject = async (scene, videoData, videoList, markerShadow, that) => {
    try {
        await scene.assets.releaseAsset('video-texture', videoData.uid);
        await scene.assets.releaseAsset('material', `material-${videoData.uid}`);

        if (!videoData.file_url) throw '无资源URL';
        let video = await scene.createVideoTexture({
            src: videoData.file_url,
            autoPlay: false,
            loop: true,
            abortAudio: false,
            assetId: videoData.uid,

        });
        if (!scene) return;
        let material = await scene.createMaterial(
            await scene.assets.getAsset('effect', videoData.effect || 'standard'), {
                // await scene.assets.getAsset('effect', 'standard'), {
                u_baseColorMap: video.texture,
            }
        );
        if (!scene) return;
        const node = scene.createElement(XRFrameSystem.XRMesh);
        if (!node) return;
        node.setId(videoData.uid)
        node.getComponent(XRFrameSystem.Mesh).setData({
            material: material,
            geometry: scene.assets.getAsset('geometry', 'plane'),
            assetId: `material-${videoData.uid}`,

            // uid: videoData.uid,
        });
        if (!videoList) return;
        that.videoList.push(video);
        if (!markerShadow || !node) return;
        await addObjectToShadow(markerShadow, node, videoData['3d_info'], true, that);
        return;
    } catch (err) {
        console.error('XR-FRAME: 视频素材加载错误: ', err);
    }
}

export const loadImageObject = async (scene, imageData, markerShadow, textList, that) => {
    try {
        await scene.assets.releaseAsset('texture', imageData.uid);
        await scene.assets.releaseAsset('material', `material-${imageData.uid}`);

        if (!imageData.file_url) throw '无资源URL';
        if (imageData.type === "image") {
            const {
                rotation
            } = imageData['3d_info'];
            [rotation.y, rotation.z] = [rotation.z, rotation.y];
        }

        let image = await scene.assets.loadAsset({
            type: 'texture',
            assetId: imageData.uid,
            src: imageData.file_url,
        });
        if (!scene) return;
        let material = await scene.createMaterial(
            scene.assets.getAsset('effect', 'standard'), {
                u_baseColorMap: image.value,
            }
        );
        material.renderQueue = 2500;
        material.alphaCutOff = 0;

        material.alphaMode = "BLEND";
        material.setRenderState('cullOn', false);
        if (!scene) return;
        const node = scene.createElement(XRFrameSystem.XRMesh);
        if (!node) return;
        node.getComponent(XRFrameSystem.Mesh).setData({
            material: material,
            geometry: scene.assets.getAsset('geometry', 'plane'),
            assetId: `material-${imageData.uid}`,
            // uid: imageData.uid,
            // id:imageData.file_uid

        });
        node.setId(imageData.uid)
        node.setAttribute('states', 'cullOn: false');
        if (imageData.event) {
            node.setAttribute('cube-shape', 'true');
            node.event.add('touch-shape', async () => {
                if (that.data.workflowType === 3 && !that.firstFlag) return
                that.triggerEvent('showInteractMedia', imageData.event, {
                    composed: true,
                    capturePhase: false,
                    bubbles: true
                });
                if (that.data.workflowType === 4) return
                clearTimeout(that.timer)
                that.innerAudioContext2?.pause() // 关闭
                that.triggerEvent('bgcMusicClose', {});
                await that.StayPageShow()

            });
        }
        if (!markerShadow || !node) return;


        await addObjectToShadow(markerShadow, node, imageData['3d_info'], true, that);

        if (!textList) return
        // if (!imageData.hasOwnProperty("text")) return
        if (!isNaN(imageData.location)) {

            that.textList.splice(imageData.location, 0, {
                node: node,
                '3d_info': imageData['3d_info'],
                uid: imageData.uid
            })
        } else {
            that.textList.push({
                node: node,
                '3d_info': imageData['3d_info'],
                uid: imageData.uid
            });
        }

        return;
    } catch (err) {
        console.error('XR-FRAME: 图片素材加载错误: ', err);
    }
}
export const replaceMaterial = async (scene, imageData, markerShadow, textList, that) => {
    try {
        await scene.assets.releaseAsset('texture', imageData.uid);
        if (!imageData.file_url) throw '无资源URL';
        let image = await scene.assets.loadAsset({
            type: 'texture',
            assetId: imageData.uid,
            src: imageData.file_url,
        });
        if (!scene) return;
        let material = await scene.createMaterial(
            scene.assets.getAsset('effect', 'standard'), {
                u_baseColorMap: image.value,
            }
        );
        material.renderQueue = 2500;
        material.alphaMode = "BLEND";
        if (!scene) return;
        const node = scene.getElementById(imageData.uid);
        if (!node) return;
        node.getComponent(XRFrameSystem.Mesh).setData({
            material: material,
            geometry: scene.assets.getAsset('geometry', 'plane'),
            assetId: `material-${imageData.uid}`,

            // uid: imageData.uid,
            // id:imageData.file_uid

        });
        // node.setId(imageData.file_uid)
        node.setAttribute('states', 'cullOn: false');


        if (imageData.event) {
            node.setAttribute('cube-shape', 'true');
            node.event.add('touch-shape', async () => {
                if (that.data.workflowType === 3 && !that.firstFlag) return
                that.triggerEvent('showInteractMedia', imageData.event, {
                    composed: true,
                    capturePhase: false,
                    bubbles: true
                });
                if (that.data.workflowType === 4) return
                clearTimeout(that.timer)
                that.innerAudioContext2?.pause() // 播放
                that.triggerEvent('bgcMusicClose', {});
                // await that.StayPageShow()

            });
        }
        if (!markerShadow || !node) return;
        await addObjectToShadow(markerShadow, node, imageData['3d_info'], true, that);

        if (!textList) return
        // if (!imageData.hasOwnProperty("text")) return
        textList.forEacth((obj, index) => {
            if (obj.uid === imageData.uid) {
                that.textList.splice(index, 1, {
                    node: node,
                    '3d_info': imageData['3d_info'],
                    uid: imageData.uid
                })
                return
            }
        })
        if (!isNaN(imageData.location)) {

            that.textList.splice(imageData.location, 0, {
                node: node,
                '3d_info': imageData['3d_info'],
                uid: imageData.uid
            })
        } else {
            that.textList.push({
                node: node,
                '3d_info': imageData['3d_info'],
                uid: imageData.uid
            });
        }

        return;
    } catch (err) {
        console.error('XR-FRAME: 图片素材替换错误: ', err);
    }
}
export const addObjectToShadow = (markerShadow, node, threeD, isPlane, that) => {
    return new Promise((resolve, reject) => {
        try {
            if (!markerShadow || !node) return;
            markerShadow.addChild(node);
            if (!node) return;
            const transform = node.getComponent(XRFrameSystem.Transform);
            if (!transform) return;
            if (isPlane) {
                transform.scale.setValue(threeD.scale.x, threeD.scale.z, threeD.scale.y);
                transform.rotation.setValue(
                    threeD.rotation.x * (Math.PI / 180) + (Math.PI / 2),
                    threeD.rotation.y * (Math.PI / 180),
                    threeD.rotation.z * (Math.PI / 180),

                );
            } else {
                transform.scale.setValue(threeD.scale.x, threeD.scale.y, threeD.scale.z);
                transform.rotation.setValue(
                    threeD.rotation.x * (Math.PI / 180),
                    threeD.rotation.y * (Math.PI / 180),
                    threeD.rotation.z * (Math.PI / 180),

                );
            }
            transform.position.setValue(threeD.position.x, threeD.position.y, threeD.position.z);
            that.triggerEvent('handleAssetsProgress', {
                index: that.i++,
                length: that.list.length + 1
            }, {
                composed: true,
                capturePhase: false,
                bubbles: true
            })
            resolve();
        } catch (err) {
            console.error('XR-FRAME: 添加到Shadow节点错误: ', err);
            reject(err);
        }
    });
}

export const addTemplateTextAnimator = async (template, scene, that) => {
    try {
        if (!scene._components) return;
        if (template === '模版四') {
            await handleTemplate4KeyFrame(that)
            return
        }
        for (let [index, item] of that.textList.entries()) {
            let animator = item.node.addComponent(XRFrameSystem.Animator);

            switch (template) {
                case '模版一':
                    var keyframe = generateTemplate1KeyFrame(Object.values(item['3d_info'].scale), index, 0, 2.5);
                    break;
                case '模版二':
                    var keyframe = generateTemplate2KeyFrame(Object.values(item['3d_info'].scale));
                    break;
                case '模版三':
                    var keyframe = generateTemplate3KeyFrame(Object.values(item['3d_info'].scale));
            }
            animator.addAnimation(new XRFrameSystem.KeyframeAnimation(
                scene,
                keyframe,
            ));
            that.animatorList.push({
                animator: animator,
                name: 'animate'
            });
        }
        return;
    } catch (err) {
        console.error('模版文案动画添加处理错误: ', err);
    }
}

export const startAnimatorAndVideo = async (that) => {
    try {
        for (let animator of that.animatorList) {
            animator.animator.play(animator.name);
        }
        for (let video of that.videoList) {
            video.stop();
            setTimeout(async () => {
                await video.play();
            }, 50);
        }
    } catch (err) {
        console.error('XR-FRAME: 场景动画开始错误: ', err);
    }
}

export const stopAnimatorAndVideo = async (that, release) => {
    try {
        for (let animator of that.animatorList) {
            animator.animator.stop();
        }
        for (let video of that.videoList) {
            video.stop();
            if (release) video.release();
        }
    } catch (err) {
        console.error('XR-FRAME: 场景动画停止错误: ', err);
    }
}

export const handleShadowRotate = (that, type = undefined) => {
    try {
        if (!type) {
            type = that.data.p_arData.p_ar?.template_type
        }
        that.handleTouchStart = (event) => {
            if (event.touches.length !== 1) return;
            that.setData({
                touch: {
                    clientX: event.touches[0].clientX,
                    clientY: event.touches[0].clientY,
                }
            });
            that.scene.event.add('touchmove', that.handleTouchMove.bind(that));
            that.scene.event.addOnce('touchend', that.handleTouchEnd.bind(that));
        }
        that.handleTouchMove = (event) => {
            if (event.touches.length !== 1) return;
            const xMove = event.touches[0].clientX - that.data.touch.clientX;
            const yMove = event.touches[0].clientY - that.data.touch.clientY;
            that.setData({
                touch: {
                    clientX: event.touches[0].clientX,
                    clientY: event.touches[0].clientY,
                }
            });
            if (that.data.workflowType === 2 && type === "模版四") {
                shadowRotateY(xMove, that.markerShadow2);

            } else if (that.data.workflowType === 4 && type !== "模版四") {
                shadowPositionY(yMove, that.markerShadow);
                shadowPositionX(xMove, that.markerShadow);

            } else if (that.data.workflowType === 4 && type === "模版四") {
                // shadowRotateY(xMove, that.markerShadow);
                // shadowRotateX(yMove, that.markerShadow);

            } else if (that.data.workflowType === 3 && type === "模版四") {
                shadowRotateY(xMove, that.markerShadow2);

            } else {

            }
        }
        that.handleTouchEnd = (event) => {
            that.scene.event.remove('touchmove', that.handleTouchMove)
            that.scene.event.addOnce('touchstart', that.handleTouchStart);
        }
        that.scene.event.addOnce('touchstart', that.handleTouchStart.bind(that));
    } catch (err) {
        console.error('XR旋转手势处理错误: ', err);
    }
}
export const shadowRotateX = (deltaY, markerShadow) => {
    const transform = markerShadow.getComponent(XRFrameSystem.Transform);
    transform.rotation.x += deltaY / 200;
}
export const shadowRotateY = (deltaX, markerShadow) => {
    const transform = markerShadow.getComponent(XRFrameSystem.Transform);
    transform.rotation.y += deltaX / 200;
}
export const shadowPositionY = (deltaY, markerShadow) => {
    const transform = markerShadow.getComponent(XRFrameSystem.Transform);
    transform.position.y += deltaY / 100;
}
export const shadowPositionX = (deltaX, markerShadow) => {
    const transform = markerShadow.getComponent(XRFrameSystem.Transform);
    transform.position.x += deltaX / 100;
}
export const resetPosition = (markerShadow, type) => {
    const transform = markerShadow.getComponent(XRFrameSystem.Transform);
    if (type === '模版四') {
        transform.position.setValue(0, 0, -5)

    } else {
        transform.position.setValue(0, 0, 0)
        transform.rotation.setValue(90 * (Math.PI / 180), 180 * (Math.PI / 180), 0)

    }

}
export const handleTemplate4KeyFrame = (that) => {
    let animator = that.markerShadow.addComponent(XRFrameSystem.Animator);
    animator.addAnimation(new XRFrameSystem.KeyframeAnimation(
        that.scene,
        generateGrowKeyFrame([1, 1, 1], 0.1, 4)
    ));
    let transform = that.markerShadow.getComponent(XRFrameSystem.Transform);
    transform.scale.x = 0;
    transform.scale.y = 0;
    transform.scale.z = 0;
    that.animatorList.push({
        animator: animator,
        name: 'grow',
    });
}

export const uuid = () => {
    let s = [];
    let hexDigits = "0123456789abcdef";
    for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    let uuid = s.join("");
    return uuid;
}

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// fn 是需要节流处理的函数
// wait 是时间间隔
export function throttle(fn, wait, that) {

    // previous 是上一次执行 fn 的时间
    // timer 是定时器
    let previous = 0,
        timer = null

    // 将 throttle 处理结果当作函数返回
    return async function (...args) {

        // 获取当前时间，转换成时间戳，单位毫秒
        let now = +new Date()

        // ------ 新增部分 start ------ 
        // 判断上次触发的时间和本次触发的时间差是否小于时间间隔
        if (now - previous < wait) {
            // 如果小于，则为本次触发操作设立一个新的定时器
            // 定时器时间结束后执行函数 fn 
            if (timer) clearTimeout(timer)
            timer = setTimeout(async () => {
                previous = now
                return fn.apply(that, args)
            }, wait)
            // ------ 新增部分 end ------ 

        } else {
            // 第一次执行
            // 或者时间间隔超出了设定的时间间隔，执行函数 fn
            previous = now
            return fn.apply(that, args)
        }
    }
}
export const releaseAssetList = (scene, list) => {
    console.log(scene, list)
    if (list && list?.length !== 0 && scene) {
        try {
            for (const obj of list) {
                if (!!!obj) continue
                if (obj.type === 'text') {
                    scene.assets.releaseAsset('texture', obj.uid);
                    scene.assets.releaseAsset('material', `material-${obj.uid}`);
                } else if (obj.type === "model") {
                    scene.assets.releaseAsset('gltf', obj.uid);
                } else if (obj.type === 'video') {
                    scene.assets.releaseAsset('video-texture', obj.uid);
                    scene.assets.releaseAsset('material', `material-${obj.uid}`);
                } else if (obj.type === 'screen') {
                    scene.assets.releaseAsset('texture', obj.uid);
                    scene.assets.releaseAsset('material', `material-${obj.uid}`);
                } else if (obj.type === 'image') {
                    scene.assets.releaseAsset('texture', obj.uid);
                    scene.assets.releaseAsset('material', `material-${obj.uid}`);
                } else {}
            }
            scene.assets.releaseAsset('env-data', 'env1');
        } catch (error) {
            console.log('releaseAsset失败', error)
        }
    }
}
export const removeFromScene = (n1, n2, node) => {
    n1.removeChild(node)
    n2.removeChild(node)


}
export const backgroundAudioList = {
    '模版二': 'https://ar.ahzyssl.com/aimall-production-tob-anhui-ar/others/7f788aa8c031a8996838fb1e4a6d9089.mp3',
    '模版三': 'https://ar.ahzyssl.com/aimall-production-tob-anhui-ar/others/9340d285364310ebc1eaedf8f980ad26.mp3',
    '模版四': 'https://ar.ahzyssl.com/aimall-production-tob-anhui-ar/others/c206374a0b1e11c2429faf0e3c4ba7e5.mp3',
    'xr-env': 'https://ar.ahzyssl.com/aimall-production-tob-anhui-ar/env/data.json'
  }