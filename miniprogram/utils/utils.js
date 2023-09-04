export const homeRecognizeYUV = (data) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'http://dev-tob-anhui-ar.aimall-tech.com/api/m/ar/home/quick_scan/pack_recognize_rgb',
            method: 'POST',
            data: data,
            header: {
                'content-type': 'application/json',
                'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInZlcnNpb24iOjF9.eyJhY2NvdW50X3VpZCI6InUtY2pqZ2l0czlhcXBucTJiMmoybDAiLCJleHBpcmVkIjoxNjk1OTg1MjU1fQ.724xcEJSI5aCwpkvGAC7gVUTw_ykufLd7xmtLulGb1I'
            },
            success(res) {
                resolve(res.data);
            },
            fail (err) {
                reject(err);
            }
        });
    });
}