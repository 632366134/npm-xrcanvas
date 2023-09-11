import {
    workflow,
    getArList
} from '../../src/xr-canvas/utils'
Page({
    data: {
        workflowType:2,
        p_arData: {
        },
        workflowData: {
            "cigarettes": [{
                    "back_image_uid": "",
                    "back_image_url": "",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "sku": "黄山(徽商新概念细支)",
                    "uid": ""
                },
                {
                    "back_image_uid": "",
                    "back_image_url": "",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "sku": "黄山(徽商新概念细支)",
                    "uid": ""
                },
                {
                    "back_image_uid": "",
                    "back_image_url": "",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "sku": "黄山(徽商新概念细支)",
                    "uid": ""
                },
                {
                    "back_image_uid": "",
                    "back_image_url": "",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "sku": "黄山(徽商新概念细支)",
                    "uid": ""
                },
                {
                    "back_image_uid": "",
                    "back_image_url": "",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "sku": "黄山(徽商新概念细支)",
                    "uid": ""
                },
                {
                    "back_image_uid": "",
                    "back_image_url": "",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "sku": "黄山(徽商新概念细支)",
                    "uid": ""
                },
                {
                    "back_image_uid": "",
                    "back_image_url": "",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "sku": "黄山(徽商新概念细支)",
                    "uid": ""
                },
                {
                    "back_image_uid": "",
                    "back_image_url": "",
                    "front_image_uid": "f-cih8auk9aqpu9knu3hug",
                    "front_image_url": "https://oss-debug.aimall-tech.com/aimall-tob-anhui-ar/images/f5e190e139e05cead579e857e6cd4271.png",
                    "sku": "黄山(徽商新概念细支)",
                    "uid": ""
                }
            ],
            "p_ending":null,
            "p_ending_uid": "",
            "p_guide": null,
            "p_guide_uid": "",
            "p_scan": null,
            "p_scan_uid": ""
        },
        flag:false
    },
    async onLoad() {
        const {
            result
        } = await getArList("1,1")
        console.log(result, 'd')
        this.setData({
            p_arData: result.items[0],
            flag:true
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

})