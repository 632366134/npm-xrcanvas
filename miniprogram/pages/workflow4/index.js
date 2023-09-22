import {
    getArList,
    getskuTemplatesList
} from '../../src/xr-canvas/utils'
Page({
    data: {
        workflowType: 4,
        p_arData: {},
        workflowData: {
            "p_guide_uid": "",
            "p_guide": {
                "uid": "ml-cj0sjss9aqpn3j2l3vsg",
                "name": "徽商加载2",
                "image_uid": "f-cj0sjr49aqpn3j2l3vr0",
                "image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/others/14f9785996fbaf38de6242a06b586232.jpeg"
            },
            "p_scan_uid": "",
            "p_scan": {
                "uid": "ms-ci8knpc9aqpqkpa4bu3g",
                "name": "扫描页",
                "image_uid": "f-ci8knos9aqpqkpa4bu20",
                "image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/d8ee79214bf0f8149d83fa7b852d3611.png"
            },
            "p_loading_uid": "",
            "p_loading": {
                "uid": "ml-cj0sjss9aqpn3j2l3vsg",
                "name": "徽商加载2",
                "image_uid": "f-cj0sjr49aqpn3j2l3vr0",
                "image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/others/14f9785996fbaf38de6242a06b586232.jpeg"
            },
            "p_ending_uid": "",
            "p_ending": {
                "uid": "me-cj129r49aqplk7mqgjgg",
                "name": "123123123123",
                "text": "<p><br></p>"
            },
            "cigarettes": [{
                    "uid": "",
                    "sku": "黄山(徽商新概念细支)",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "back_image_uid": "",
                    "back_image_url": ""
                },
                {
                    "uid": "",
                    "sku": "黄山(徽商新概念细支)",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "back_image_uid": "",
                    "back_image_url": ""
                },
                {
                    "uid": "",
                    "sku": "黄山(徽商新概念细支)",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "back_image_uid": "",
                    "back_image_url": ""
                },
                {
                    "uid": "",
                    "sku": "黄山(徽商新概念细支)",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "back_image_uid": "",
                    "back_image_url": ""
                },
                {
                    "uid": "",
                    "sku": "黄山(徽商新概念细支)",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "back_image_uid": "",
                    "back_image_url": ""
                },
                {
                    "uid": "",
                    "sku": "黄山(徽商新概念细支)",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "back_image_uid": "",
                    "back_image_url": ""
                },
                {
                    "uid": "",
                    "sku": "黄山(徽商新概念细支)",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "back_image_uid": "",
                    "back_image_url": ""
                },
                {
                    "uid": "",
                    "sku": "黄山(徽商新概念细支)",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "back_image_uid": "",
                    "back_image_url": ""
                }
            ]
        },
        width: 200,
        height: 200,
        flag: false,
        XRHeight: 200,
        XRWidth: 200,
        list: [],
        box1Flag: true,
        box2Flag: false,
        box3Flag: false,
        arList: [],
        value1: '',
        value2: '',
        value3: '',
        value4: ''
    },
    async onLoad() {
        const {
            result
        } = await getskuTemplatesList(`?pl=100,0`)
        console.log(result, 'd')
        this.setData({
            flag: true,
            list: result.skus
        })
    },
    onUnload() {


    },
    async loadingChange({
        detail
    }) {
        console.log(detail, 'loadingchange')
        if (!detail.handleAssetsLoaded) return
        const node = this.node = this.selectComponent('#npm-xrframe').selectComponent('#xr-canvas')
        await this.node.stopAnimatorAndVideo2()
    },
    async showArBox({
        currentTarget
    }) {
        const {
            result
        } = await getArList("10,1")
        this.setData({
            box2Flag: true,
            arList: result.items,
            box1Flag: false
        })
    },
    showArBox2({
        currentTarget
    }) {
        console.log(currentTarget, 'e')
        let data = currentTarget.dataset.data
        if (data.p_ar.template_type === '模版一') {
            this.setData({
                box2Flag: false,
                box3Flag: true,
                flag: true,
                p_arData: data,
                value1: data.p_ar.text_list[0].text,
                value2: data.p_ar.text_list[1].text,
                value3: data.p_ar.text_list[2].text,
                value4: data.p_ar.text_list[3].text,
            })
        } else if (data.p_ar.template_type === '模版三') {
            this.setData({
                box2Flag: false,
                box3Flag: true,
                flag: true,
                p_arData: data,
                value1: data.p_ar.text_list[0].text,
                value2: data.p_ar.text_list[1].text,
                value3: data.p_ar.text_list[2].text,
            })
        } else {
            this.setData({
                box2Flag: false,
                box3Flag: true,
                flag: true,
                p_arData: data,
                // value1: data.p_ar.text_list[0].text,
                // value2: data.p_ar.text_list[1].text,
                // value3: data.p_ar.text_list[2].text,
            })
        }

    },
    bindblur({
        detail,
        currentTarget
    }) {
        console.log(detail.value, currentTarget.dataset.index, 'e')
        this.drawCanvas(detail.value, currentTarget.dataset.index)
    },
    drawCanvas(text, index) {
        let p_arData = this.data.p_arData
        const ctx = wx.createCanvasContext('textCanvas'); // 获取 canvas 上下文

        // 绘制文本框背景
        let canvasWidth = 200
        let canvasHeight = 200

        ctx.setFillStyle('#f0f0f0'); // 设置背景颜色
        ctx.fillRect(0, 0, canvasWidth, canvasHeight); // 填充背景颜色

        // 绘制文本边框
        ctx.setStrokeStyle('#000'); // 设置边框颜色
        ctx.setLineWidth(2); // 设置边框宽度
        ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20); // 绘制边框

        // 绘制用户输入的文字
        ctx.setFillStyle('#000'); // 设置文字颜色
        ctx.setFontSize(20); // 设置文字大小
        ctx.setTextAlign('center'); // 设置文字水平居中
        ctx.setTextBaseline('middle'); // 设置文字垂直居中
        ctx.fillText(text, canvasWidth / 2, canvasHeight / 2); // 绘制文字

        // 绘制完成后保存为图片
        ctx.draw(false, () => {
            wx.canvasToTempFilePath({
                canvasId: 'textCanvas',
                success: (res) => {
                    console.log(res.tempFilePath); // 在这里可以获取到生成的 PNG 图片路径
                    if (p_arData.p_ar.template_type === '模版一' || p_arData.p_ar.template_type === '模版三') {
                        let textListRaw = p_arData.p_ar.text_list
                        textListRaw[index - 1].text = text
                        textListRaw[index - 1].file_url = res.tempFilePath
                        this.setData({
                            textListRaw
                        })
                    }else{
                        let textListRaw = p_arData.p_ar.text_list
                        textListRaw[index - 1].text = text
                        textListRaw[index - 1].file_url = res.tempFilePath
                        this.setData({
                            textListRaw
                        })
                    }
                },
                fail: (err) => {
                    console.error(err);
                },
            });
        });
    }

})