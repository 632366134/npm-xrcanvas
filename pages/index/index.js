// index.js
Page({
    data: {
        width: 300,
        height: 300,
        renderWidth: 300,
        renderHeight: 300,
        texts: [],
        obsListRaw:[{id:1,projectCode:1,url:"https://arp3.arsnowslide.com/undefined/319292761266671616/undefined/1674012576482.png"},
        // {id:4,projectCode:2,url:"https://arp3.arsnowslide.com/undefined/319293236959465472/undefined/1671501529227.png"}
    ],
        videoListRaw:[{id:2,projectCode:1,url:"https://h5-project.oss-cn-shenzhen.aliyuncs.com/XR/test2.mp4",scale:[1,1,1],position:[0,-2,0],rotation:[0,0,0]}],
        gltfListRaw:[{id:3,scale:[0.01,0.01,0.01],position:[0,0,1],rotation:[-90,0,0],projectCode:2,url:"https://arp3.arsnowslide.com/undefined/319565566776397824/undefined/index.glb"}],
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
            renderHeight: height * dpi
        });
    }
})