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
            url: "https://arp3.arsnowslide.com/undefined/319292761266671616/undefined/1674012576482.png"
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
        gltfListRaw: [{
            id: 6,
            scale: [0.1, 0.1, 0.1],
            position: [0, 0, 0.6],
            rotation: [-90, 0, 0],
            projectCode: 1,
            // url: "https://arp3.arsnowslide.com/undefined/396100883129520128/undefined/huipaijianzhu.glb",
            url: "https://arp3.arsnowslide.com/zz/huipaijianzhu_v3.glb",

            name: 'parent'
        }],
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
    arr({
        detail
    }) {

        console.log({
            detail
        })
        // let url = 'data:image/png;base64,' + wx.arrayBufferToBase64(detail.uvBuffer)
        // this.setData({
        //     resultImage: url
        // })
        function resizeUV(uvData, originalWidth, originalHeight, targetWidth, targetHeight) {
            const resizedUVData = new Uint8Array(targetWidth * targetHeight * 2); // 2 是因为UV数据通常占用两个字节

            const uvScaleX = originalWidth / targetWidth;
            const uvScaleY = originalHeight / targetHeight;

            for (let j = 0; j < targetHeight; j++) {
                for (let i = 0; i < targetWidth; i++) {
                    const originalX = Math.floor(i * uvScaleX);
                    const originalY = Math.floor(j * uvScaleY);

                    const uvIndex = j * targetWidth * 2 + i * 2;
                    resizedUVData[uvIndex] = uvData[originalY * originalWidth + originalX];
                    resizedUVData[uvIndex + 1] = uvData[originalY * originalWidth + originalX + 1];
                }
            }

            return resizedUVData;
        }
        function convertYUVtoRGB(yData, uData, vData, width, height) {
            const rgbData = new Uint8Array(width * height * 3);
          
            for (let j = 0; j < height; j++) {
              for (let i = 0; i < width; i++) {
                const uvIndex = Math.floor(j / 2) * Math.floor(width / 2) + Math.floor(i / 2) * 2;
                const yIndex = j * width + i;
          
                const Y = yData[yIndex];
                const U = uData[uvIndex];
                const V = vData[uvIndex];
          
                const R = Y + 1.13983 * (V - 128);
                const G = Y - 0.39465 * (U - 128) - 0.58060 * (V - 128);
                const B = Y + 2.03211 * (U - 128);
          
                const rgbIndex = yIndex * 3;
                rgbData[rgbIndex] = Math.max(0, Math.min(255, R));
                rgbData[rgbIndex + 1] = Math.max(0, Math.min(255, G));
                rgbData[rgbIndex + 2] = Math.max(0, Math.min(255, B));
              }
            }
          
            return rgbData;
          }
        // 假设 uvBuffer 是包含UV数据的ArrayBuffer
        const uvArray = new Uint8Array(detail.uvBuffer);
        const uData = uvArray.slice(0, uvArray.length / 2); // 前半部分是U通道
        const vData = uvArray.slice(uvArray.length / 2); // 后半部分是V通道
        const yArray = new Uint8Array(detail.yBuffer);
        const resizedUData = resizeUV(uData, detail.width/2, detail.height/2, detail.width/2, detail.height/2);
        const resizedVData = resizeUV(vData, detail.width/2, detail.height/2, detail.width/2, detail.height/2);
        const resizedYData = resizeUV(yArray, detail.width/2, detail.height/2, detail.width/2, detail.height/2);
        const rgbData = convertYUVtoRGB(resizedYData, resizedUData, resizedVData, detail.width/2, detail.height/2);
        // 现在你可以使用 rgbData 来生成图像
        // this.drawRGBImage(rgbData)
        console.log(rgbData, 'rgb')
    },
    drawRGBImage(rgbData) {
        const query = wx.createSelectorQuery()
        query.select('#canvas')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node
                const ctx = canvas.getContext('webgl')
                // 设置canvas的宽高
                canvas.drawImage('path/to/your/background/image.jpg', 0, 0, this.data.canvasWidth, this.data.canvasHeight);

                // 将RGB数据绘制到canvas上
                const imageData = canvas.createImageData();
                imageData.width = this.data.canvasWidth
                imageData.height = this.data.canvasHeight
                for (let i = 0; i < rgbData.length; i += 3) {
                    imageData.data[i] = rgbData[i];
                    imageData.data[i + 1] = rgbData[i + 1];
                    imageData.data[i + 2] = rgbData[i + 2];
                    imageData.data[i + 3] = 255; // 透明度
                }
                wx.canvasPutImageData({
                    'canvasId': canvas,
                    data: canvasimageData,
                    x: 0,
                    y: 0,
                    width: this.data.canvasHeight,
                    height: this.data.canvasWidth,
                    success(res) {
                        console.log(res, 'res')
                        // 将canvas内容导出为JPEG格式
                        canvas.toTempFilePath({
                            fileType: 'jpg',
                            success: (res) => {
                                console.log(res.tempFilePath); // 这里是导出的JPEG图片路径
                            },
                            fail: (error) => {
                                console.error(error);
                            }
                        });
                    },
                    fail(err) {
                        console.log(err, 'err')
                    }
                });


            })

    }

    // tapFuction({
    //     detail
    // }) {
    //     console.log(detail.data)
    //     wx.showModal({
    //         title: 'tap',
    //         content: detail.data.url,
    //         complete: (res) => {
    //             if (res.cancel) {

    //             }

    //             if (res.confirm) {

    //             }
    //         }
    //     })
    // }

})