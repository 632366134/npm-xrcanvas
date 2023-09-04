import {
    //   homeRecognize,
    homeRecognizeYUV
} from '../utils/utils';
import * as YUVUtils from './yuv';
// import '../xr-custom/effects/removeBlack';
// import '../xr-custom/effects/transparentVideo'
import {
  generateTemplate1KeyFrame
} from './template1';
// import {
//   generateTemplate2KeyFrame
// } from "../xr-custom/keyframes/template2";
import {
  generateTemplate3KeyFrame
} from './template3';
// import {
//   generateGrowKeyFrame
// } from '../xr-custom/keyframes/grow';

const FSM = wx.getFileSystemManager();

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
    } else {
        that.setData({
            xrShow: true,
        });
    }
}

export const initXRFrame = (that, width, height) => {
    const {
        windowWidth: windowWidth,
        windowHeight: windowHeight,
        pixelRatio: dpi,
    } = wx.getSystemInfoSync();
    that.setData({
        "xr.width": width || windowWidth,
        "xr.height": height || windowHeight,
        "xr.renderWidth": width ? width * dpi : windowWidth * dpi,
        "xr.renderHeight": height ? height * dpi : windowHeight * dpi,
    });
}

export const handleXRCompatibility = () => {
    const notSupportedList = ['iPhone 12/13 (Pro)'];
    const lowestVersion = {
        iOS: '8.0.36',
        Android: '8.0.35',
        SDK: '2.32.0'
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

export const saveSceneAsImage = (scene) => {
    let base64 = scene.share.captureToDataURL({
        type: 'jpg',
        quality: 0.8
    });
    const ImagePath = `${wx.env.USER_DATA_PATH}/scene.jpg`;
    const ImageData = base64.replace(/^data:image\/\w+;base64,/, "");
    FSM.writeFileSync(ImagePath, ImageData, "base64");
    return ImagePath;
}

export const recognizeCigarette = (scene) => {
    return new Promise(async (resolve) => {
        try {
            if (!scene._components) return resolve('break');
                let rgbData = YUVUtils.arRawDataToRGB(scene);
                var recognizedResult = await homeRecognizeYUV(rgbData);
         
            console.log('XR-FRAME 烟包识别接口', recognizedResult);
            if (recognizedResult.err_code !== 0) throw recognizedResult.err_desc || null;
            return resolve(recognizedResult.result);
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
        console.log(objects,result)
        return objects;
    } catch (err) {
        console.error('3D素材数据处理错误: ', err);
    }
}

export const loadModelObject = async (scene, modelData, animatorList, markerShadow) => {
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
        node.getComponent(XRFrameSystem.GLTF).setData({
            model: model.value,
        });
        if (!node) return;
        node.event.addOnce('gltf-loaded', (detail) => {
            let gltf = detail.target.getComponent('gltf');
            if (gltf._animations.length === 0) return;
            let animator = detail.target.getComponent('animator');
            if (!animatorList) return;
            animatorList.push({
                animator: animator,
                name: gltf._animations[0].clipNames[0],
            });
        });
        if (!markerShadow || !node) return;
        await addObjectToShadow(markerShadow, node, modelData['3d_info'], false);
        return;
    } catch (err) {
        console.error('XR-FRAME GLTF模型加载错误: ', err);
    }
}

export const loadVideoObject = async (scene, videoData, videoList, markerShadow) => {
    try {
        await scene.assets.releaseAsset('video-texture', videoData.uid);
        if (!videoData.file_url) throw '无资源URL';
        let video = await scene.createVideoTexture({
            src: videoData.file_url,
            autoPlay: false,
            loop: true,
            abortAudio: false,
        });
        if (!scene) return;
        let material = await scene.createMaterial(
            await scene.assets.getAsset('effect', videoData.effect || 'standard'), {
                u_baseColorMap: video.texture,
            }
        );
        if (!scene) return;
        const node = scene.createElement(XRFrameSystem.XRMesh);
        if (!node) return;
        node.getComponent(XRFrameSystem.Mesh).setData({
            material: material,
            geometry: scene.assets.getAsset('geometry', 'plane'),
            uid: videoData.uid,
        });
        if (!videoList) return;
        videoList.push(video);
        if (!markerShadow || !node) return;
        await addObjectToShadow(markerShadow, node, videoData['3d_info'], true);
        return;
    } catch (err) {
        console.error('XR-FRAME: 视频素材加载错误: ', err);
    }
}

export const loadImageObject = async (scene, imageData, markerShadow, textList, that) => {
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
        const node = scene.createElement(XRFrameSystem.XRMesh);
        if (!node) return;
        node.getComponent(XRFrameSystem.Mesh).setData({
            material: material,
            geometry: scene.assets.getAsset('geometry', 'plane'),
            uid: imageData.uid,
        });
        if (textList) textList.push({
            node: node,
            '3d_info': imageData['3d_info'],
        });
        node.setAttribute('states', 'cullOn: false');
        if (imageData.event) {
            node.setAttribute('cube-shape', 'true');
            node.event.add('touch-shape', () => {
                that.triggerEvent('showInteractMedia', imageData.event);
            });
        }
        if (!markerShadow || !node) return;
        await addObjectToShadow(markerShadow, node, imageData['3d_info'], true);
        return;
    } catch (err) {
        console.error('XR-FRAME: 图片素材加载错误: ', err);
    }
}

export const addObjectToShadow = (markerShadow, node, threeD, isPlane) => {
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
                    threeD.rotation.z * (Math.PI / 180)
                );
            } else {
                transform.scale.setValue(threeD.scale.x, threeD.scale.y, threeD.scale.z);
                transform.rotation.setValue(
                    threeD.rotation.x * (Math.PI / 180),
                    threeD.rotation.y * (Math.PI / 180),
                    threeD.rotation.z * (Math.PI / 180)
                );
            }
            transform.position.setValue(threeD.position.x, threeD.position.y, threeD.position.z);
            resolve();
        } catch (err) {
            console.error('XR-FRAME: 添加到Shadow节点错误: ', err);
            reject(err);
        }
    });
}

export const addTemplateTextAnimator = (template, scene, textList, animatorList) => {
    try {
        if (template === '模版四' || !scene._components) return;
        for (let index in textList) {
            let animator = textList[index].node.addComponent(XRFrameSystem.Animator);
            switch (template) {
                case '模版一':
                    var keyframe = generateTemplate1KeyFrame(Object.values(textList[index]['3d_info'].scale), index, 0, 2.5);
                    break;
                case '模版二':
                    var keyframe = generateTemplate2KeyFrame(Object.values(textList[index]['3d_info'].position), index);
                    break;
                case '模版三':
                    var keyframe = generateTemplate3KeyFrame(Object.values(textList[index]['3d_info'].scale));
            }
            animator.addAnimation(new XRFrameSystem.KeyframeAnimation(
                scene,
                keyframe,
            ));
            animatorList.push({
                animator: animator,
                name: 'animate'
            });
        }
        return;
    } catch (err) {
        console.error('模版文案动画添加处理错误: ', err);
    }
}

export const startAnimatorAndVideo = async (animatorList, videoList) => {
    try {
        console.log(animatorList,videoList)
        for (let animator of animatorList) {
            animator.animator.play(animator.name);
        }
        for (let video of videoList) {
            video.stop();
            await video.play();
        }
    } catch (err) {
        console.error('XR-FRAME: 场景动画开始错误: ', err);
    }
}

export const stopAnimatorAndVideo = async (animatorList, videoList, release) => {
    try {
        for (let animator of animatorList) {
            animator.animator.stop();
        }
        for (let video of videoList) {
            video.stop();
            if (release) video.release();
        }
    } catch (err) {
        console.error('XR-FRAME: 场景动画停止错误: ', err);
    }
}

export const handleShadowRotate = (that) => {
    try {
        console.log(that,'taht')
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
            shadowRotateY(xMove, that.screenNode);
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

export const shadowRotateY = (deltaX, screenNode) => {
    const transform = screenNode.getComponent(XRFrameSystem.Transform);
    transform.rotation.y += deltaX / 200;
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

export const backgroundAudioList = {
    '模版三': 'https://oss-debug.aimall-tech.com/aimall-production-tob-anhui-ar/videos/2.mp3',
    '模版四': 'https://oss-debug.aimall-tech.com/aimall-production-tob-anhui-ar/videos/1.mp3',
}