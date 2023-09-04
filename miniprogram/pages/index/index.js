Page({
    data: {
        width: 300,
        height: 300,
        renderWidth: 300,
        renderHeight: 300,
        texts: [],
        canvasWidth: 320, // 设置canvas宽度
        canvasHeight: 240, // 设置canvas高度
        xrFlag: false,
        resultImage: '',
        obsListRaw: [{
            id: 1,
            projectCode: 1,
            url: "/assets/xy5.png"
        }],
        videoListRaw: [

            // {
            //     id: 2,
            //     projectCode: 1,
            //     url: "https://arp3.arsnowslide.com/undefined/319292761266671616/undefined/app~1.mp4",
            //     scale: [1, 1, 1],
            //     position: [0, -2, 0],
            //     rotation: [0, 0, 0],
            //     opacity: false
            // },
            // {
            //     id: 5,
            //     projectCode: 2,
            //     url: "https://arp3.arsnowslide.com/undefined/319292761266671616/undefined/app~1.mp4",
            //     scale: [1, 1, 1],
            //     position: [0, 0, 0],
            //     rotation: [0, 0, 0],
            //     opacity: true
            // }
        ],
        gltfListRaw: [
        //     {
        //     id: 6,
        //     scale: [0.1, 0.1, 0.1],
        //     position: [0, 0, 0.6],
        //     rotation: [-90, 0, 0],
        //     projectCode: 1,
        //     // url: "https://arp3.arsnowslide.com/undefined/396100883129520128/undefined/huipaijianzhu.glb",
        //     // url: "https://arp3.arsnowslide.com/zz/huipaijianzhu_v3.glb",

        //     name: 'parent'
        // }
    ],
        imageListRaw: [
        //     {
        //     id: 7,
        //     scale: [1, 1, 1],
        //     position: [0, 0, 0],
        //     rotation: [0, 0, 0],
        //     projectCode: 1,
        //     // url: "https://arp3.arsnowslide.com/undefined/396100883129520128/undefined/huipaijianzhu.glb",
        //     // url: "https://holodata.s3.cn-northwest-1.amazonaws.com.cn/nameCardData/mingpiantu.png",
        // }
    ],
        keyframeListRaw: [{
            parentId: 6,
            id: 3,
            keyframe: '/assets/animation/miku.json',
            name: 'parent'
        }]
    },
    onLoad() {

        const info = wx.getSystemInfoSync();
        const width = info.windowWidth;
        const height = info.windowHeight;
        const dpi = info.pixelRatio;
        this.setData({
            width,
            height,
            renderWidth: width * dpi,
            renderHeight: height * dpi,
            xrFlag: true
        });

    },
    onUnload() {
        this.setData({
            xrFlag: false
        })

    },
    // arr({
    //     detail
    // }) {

    //     console.log({
    //         detail
    //     })

    //     function convertNV12toRGBA(yData, uvData, width, height) {
    //         const rgbaData = new Uint8Array(width * height * 4);

    //         for (let j = 0; j < height; j++) {
    //             for (let i = 0; i < width; i++) {
    //                 const uvIndex = Math.floor(j / 2) * Math.floor(width / 2) * 2 + Math.floor(i / 2) * 2;
    //                 const yIndex = j * width + i;

    //                 const Y = yData[yIndex];
    //                 const U = uvData[uvIndex] - 128;
    //                 const V = uvData[uvIndex + 1] - 128;

    //                 const R = Math.max(0, Math.min(255, Y + 1.13983 * V));
    //                 const G = Math.max(0, Math.min(255, Y - 0.39465 * U - 0.58060 * V));
    //                 const B = Math.max(0, Math.min(255, Y + 2.03211 * U));

    //                 const rgbaIndex = yIndex * 4;
    //                 rgbaData[rgbaIndex] = R;
    //                 rgbaData[rgbaIndex + 1] = G;
    //                 rgbaData[rgbaIndex + 2] = B;
    //                 rgbaData[rgbaIndex + 3] = 255; // 透明度为255，不透明
    //             }
    //         }

    //         return rgbaData;
    //     }

    //     const yArray = new Uint8Array(detail.yBuffer);
    //     const uvArray = new Uint8Array(detail.uvBuffer);
    //     const rgbaData = convertNV12toRGBA(yArray, uvArray, detail.width, detail.height);
    //     console.log(rgbaData, 'rgbaData')
    //     const that = this
    //     const query = wx.createSelectorQuery()
    //     query.select('#myCanvas')
    //         .fields({
    //             node: true,
    //             size: true
    //         })
    //         .exec((res) => {
    //             const canvas = res[0].node
    //             let u8ca = Uint8ClampedArray.from(rgbaData)
    //             this.myCanvasCtx = canvas.getContext('2d')
    //             const dpr = wx.getSystemInfoSync().pixelRatio
    //             canvas.width = res[0].width * dpr
    //             canvas.height = res[0].height * dpr
    //             let ctxImageData = this.myCanvasCtx.createImageData(detail.width, detail.height);
    //             ctxImageData.data.set(u8ca)
    //             this.myCanvasCtx.putImageData(ctxImageData, 0, 0)
    //             let base64 = canvas.toDataURL("image/png", 0.5);
    //             // that.setData({
    //             //     path: base64
    //             // })
    //             console.log(base64, 'base64')

    //             try {
    //                 const prefix = "data:image/png;base64,";
    //                 const cleanedBase64 = base64.substring(prefix.length);
    //                 let dataArray =wx.base64ToArrayBuffer(cleanedBase64)
    //                 // const yArray = new Uint8Array(detail.yBuffer);
    //                 // const uvArray = new Uint8Array(detail.uvBuffer);
    //                 // const yuvArray = new Uint8Array(yArray.length + uvArray.length);

    //                 // // 将Y数据复制到合并数组中
    //                 // yuvArray.set(yArray, 0);
                    
    //                 // // 将UV数据复制到合并数组中
    //                 // yuvArray.set(uvArray, yArray.length);
                    
    //                 // // 将合并的Uint8Array转换为一个新的ArrayBuffer
    //                 // const dataArray = yuvArray.buffer;
    //             //     console.log(dataArray, 'buffer')
                    
    //                 const fs = wx.getFileSystemManager()
    //                 const path = wx.env.USER_DATA_PATH + "/" + new Date().getTime() + ".png"
    //                 fs.writeFileSync(path, dataArray);
    //                 that.setData({
    //                     path: path
    //                 })
    //                 console.log(res, path)
    //             } catch (e) {
    //                 console.error(e)
    //             }
    //             console.log(this.data.path, 'base64')


    //             //     const ImageData = canvas.createImageData(u8ca, detail.width, detail.height)
    //             //     console.log(ImageData,'ImageData')
    //             //     wx.canvasPutImageData({
    //             //         canvasId: 'canvas',
    //             //         data: u8ca,
    //             //         x: 0,
    //             //         y: 0,
    //             //         width: canvas.width,
    //             //         height: canvas.height,
    //             //         success(res) {
    //             //             console.log(res,'res')
    //             //             const path = canvas.toDataURL('image/png', 0.7)
    //             //             console.log(path, 'canvasdraw')
    //             //             that.setData({
    //             //                 path: path
    //             //             })
    //             //         },
    //             //         fail(err) {
    //             //             console.log(err,'eer')
    //             //             const path = canvas.toDataURL('image/png', 0.7)
    //             //             console.log(path, 'canvasdraw')
    //             //             that.setData({
    //             //                 path: path
    //             //             })
    //             //         }
    //             //     })

    //             //         wx.canvasToTempFilePath({
    //             //             canvas:canvas,
    //             //             x: 0,
    //             //             y: 0,
    //             //             width: detail.width,
    //             //             height: detail.height,
    //             //             fail(res) {
    //             //                 console.log(res)
    //             //             },
    //             //             success(res) {
    //             //                 console.log(res, 'canvasdraw')
    //             //                 that.setData({path:res.tempFilePath})

    //             //             }
    //             //         }) 
    //             // })
    //             // var u8ca=Uint8ClampedArray.from(rgbaData)
    //             // console.log(u8ca)
    //             // wx.canvasPutImageData({
    //             //     canvasId: 'canvas',
    //             //     x: 0,
    //             //     y: 0,
    //             //     width: detail.width,
    //             //     height:detail.height,
    //             //     data: u8ca,
    //             //     fail(res){
    //             //       console.log(res)
    //             //     },
    //             //     success (res) {
    //             //         console.log(res,'canvasdraw')
    //             //       setTimeout(
    //             //         function () {
    //             //           const ctx = wx.createCanvasContext('canvas')
    //             //           ctx.draw()
    //             //         }
    //             //       ,1000)

    //             //     }
    //             //   })
    //             // const uvArray = new Uint8Array(detail.uvBuffer);
    //             // const yArray = new Uint8Array(detail.yBuffer);

    //             // // 创建一个新的数组，用于存放合并后的数据
    //             // const mergedArray = new Uint8Array(uvArray.length + yArray.length);


    //             // // 将UV数据复制到合并后的数组
    //             // mergedArray.set(uvArray, 0);

    //             // // 将Y数据复制到合并后的数组
    //             // mergedArray.set(yArray, uvArray.length);
    //             // console.log(mergedArray,'mergedArray')
    //             // const mergedBuffer =mergedArray.buffer;
    //             // console.log(mergedBuffer,'mergedArray')

    //             // this.click(mergedBuffer)
    //             // let url = 'data:image/png;base64,' + wx.arrayBufferToBase64(detail.uvBuffer)
    //             // this.setData({
    //             //     resultImage: url
    //         })

    //     function resizeUV(uvData, originalWidth, originalHeight, targetWidth, targetHeight) {
    //         const resizedUVData = new Uint8Array(targetWidth * targetHeight * 2); // 2 是因为UV数据通常占用两个字节

    //         const uvScaleX = originalWidth / targetWidth;
    //         const uvScaleY = originalHeight / targetHeight;

    //         for (let j = 0; j < targetHeight; j++) {
    //             for (let i = 0; i < targetWidth; i++) {
    //                 const originalX = Math.floor(i * uvScaleX);
    //                 const originalY = Math.floor(j * uvScaleY);

    //                 const uvIndex = j * targetWidth * 2 + i * 2;
    //                 resizedUVData[uvIndex] = uvData[originalY * originalWidth + originalX];
    //                 resizedUVData[uvIndex + 1] = uvData[originalY * originalWidth + originalX + 1];
    //             }
    //         }

    //         return resizedUVData;
    //     }

    //     function convertYUVtoRGB(yData, uData, vData, width, height) {
    //         const rgbData = new Uint8Array(width * height * 3);

    //         for (let j = 0; j < height; j++) {
    //             for (let i = 0; i < width; i++) {
    //                 const uvIndex = Math.floor(j / 2) * Math.floor(width / 2) + Math.floor(i / 2) * 2;
    //                 const yIndex = j * width + i;

    //                 const Y = yData[yIndex];
    //                 const U = uData[uvIndex];
    //                 const V = vData[uvIndex];

    //                 const R = Y + 1.13983 * (V - 128);
    //                 const G = Y - 0.39465 * (U - 128) - 0.58060 * (V - 128);
    //                 const B = Y + 2.03211 * (U - 128);

    //                 const rgbIndex = yIndex * 3;
    //                 rgbData[rgbIndex] = Math.max(0, Math.min(255, R));
    //                 rgbData[rgbIndex + 1] = Math.max(0, Math.min(255, G));
    //                 rgbData[rgbIndex + 2] = Math.max(0, Math.min(255, B));
    //             }
    //         }

    //         return rgbData;
    //     }
    //     // // 假设 uvBuffer 是包含UV数据的ArrayBuffer
    //     // const uvArray = new Uint8Array(detail.uvBuffer);
    //     // const uData = uvArray.slice(0, uvArray.length / 2); // 前半部分是U通道
    //     // const vData = uvArray.slice(uvArray.length / 2); // 后半部分是V通道
    //     // const yArray = new Uint8Array(detail.yBuffer);
    //     // const resizedUData = resizeUV(uData, detail.width/2, detail.height/2, detail.width/2, detail.height/2);
    //     // const resizedVData = resizeUV(vData, detail.width/2, detail.height/2, detail.width/2, detail.height/2);
    //     // const resizedYData = resizeUV(yArray, detail.width/2, detail.height/2, detail.width/2, detail.height/2);
    //     // const rgbData = convertYUVtoRGB(resizedYData, resizedUData, resizedVData, detail.width/2, detail.height/2);
    //     // // 现在你可以使用 rgbData 来生成图像
    //     // // this.drawRGBImage(rgbData)
    //     // console.log(rgbData, 'rgb')
    // },
    tapFuction({
        detail
    }) {
        console.log(detail.data)
        wx.showModal({
            title: 'tap',
            content: detail.data.url,
            complete: (res) => {
                if (res.cancel) {

                }

                if (res.confirm) {

                }
            }
        })
    }

})