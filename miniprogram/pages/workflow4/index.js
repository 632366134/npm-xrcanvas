import {
    getArList,
    getskuTemplatesList
} from '../../src/xr-canvas/utils'
Page({
    data: {
        workflowType: 4,
        p_arData: {},
        workflowData: {},
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