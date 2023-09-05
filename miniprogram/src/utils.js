const url = 'http://dev-tob-anhui-ar.aimall-tech.com/'
const Authorization = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInZlcnNpb24iOjF9.eyJhY2NvdW50X3VpZCI6InUtY2pqZ2l0czlhcXBucTJiMmoybDAiLCJleHBpcmVkIjoxNjk2NDg5NDAyfQ.7lrl83Ssaz3_twDB70vGk94zOEQaJXyBdKi11ixhW8w'
export const homeRecognizeYUV = (data) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: url + 'api/m/ar/home/quick_scan/pack_recognize_rgb',
            method: 'POST',
            data: data,
            header: {
                'content-type': 'application/json',
                'Authorization': Authorization
            },
            success(res) {
                resolve(res.data);
            },
            fail(err) {
                reject(err);
            }
        });
    });
}
export const homeRecognize = (data) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: url + '/api/m/ar/home/quick_scan/pack_recognize',
            method: 'POST',
            data: data,
            header: {
                'content-type': 'application/json',
                'Authorization': Authorization
            },
            success(res) {
                resolve(res.data);
            },
            fail(err) {
                reject(err);
            }
        });
    });
}