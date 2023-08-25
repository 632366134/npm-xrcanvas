// index.js
Page({
    data: {
        width: 300,
        height: 300,
        renderWidth: 300,
        renderHeight: 300,
        texts: [],
        xrFlag: false,
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
            url: "/assets/model3.glb",

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
        const dataURL = this.convertYUV420ToDataURL(detail.uvBuffer, detail.width, detail.height)
console.log(dataURL); // 输出生成的数据 URL
    },
    convertYUV420ToDataURL(yuv420ArrayBuffer, width, height) {
        const query = wx.createSelectorQuery()
        query.select('#myCanvas')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node
                const uint8Array = new Uint8Array(yuv420ArrayBuffer);
                const context = canvas.getContext('2d')


                function yuv420ToRgb(y, u, v) {
                    const r = y + 1.13983 * v;
                    const g = y - 0.39465 * u - 0.58060 * v;
                    const b = y + 2.03211 * u;
                    return [r, g, b];
                }

                const imageData = context.createImageData(width, height);
                let dataIndex = 0;
                for (let i = 0; i < uint8Array.length; i += 1.5) {
                    const y = uint8Array[i];
                    const u = uint8Array[Math.floor(i / 4) + width * height];
                    const v = uint8Array[Math.floor(i / 4) + width * height * 1.25];
                    const [r, g, b] = yuv420ToRgb(y, u, v);

                    imageData.data[dataIndex++] = r;
                    imageData.data[dataIndex++] = g;
                    imageData.data[dataIndex++] = b;
                    imageData.data[dataIndex++] = 255;

                    if (i % (width * 1.5) === 0 && i > 0) {
                        dataIndex += (width - 1) * 4;
                    }
                }

                context.putImageData(imageData, 0, 0);

                return canvas.toDataURL('image/jpeg'); // 根据需要选择图片格式

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