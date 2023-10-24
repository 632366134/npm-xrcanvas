import {
    workflow,
    getArList
} from '../../src/xr-canvas/utils'
Page({
    data: {
        workflowType: 2,
        p_arData: {},
        workflowData: {
            "p_guide_uid": "",
            "p_guide": {
                "uid": "ml-cj0sjss9aqpn3j2l3vsg",
                "name": "徽商加载2",
                "image_uid": "f-cj0sjr49aqpn3j2l3vr0",
                "image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/others/14f9785996fbaf38de6242a06b586232.jpeg",
                "duration": "5"
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
            "p_ending": null,
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
        width: 400,
        height: 400,
        flag: false,
        XRHeight: 400,
        XRHeight: 400
    },
    async onLoad({
        p_arData
    }) {
        p_arData = JSON.parse(p_arData)
        this.data.workflowData.p_ar = p_arData.p_ar
        this.setData({
            flag: true,
            workflowData:this.data.workflowData,
        })
    },
    onUnload() {},
    async loadingChange({
        detail
    }) {

        if (!detail.handleAssetsLoaded) return
        const node = this.node = this.selectComponent('#npm-xrframe').selectComponent('#xr-canvas')
        await this.node.stopAnimatorAndVideo2()
    },

})