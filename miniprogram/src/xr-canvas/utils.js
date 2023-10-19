let baseUrl = wx.getStorageSync('apiHost'); // 获取域名
let Authorization = wx.getStorageSync('token'); // 获取Authorization请求头
if (!!!baseUrl) {
    baseUrl = 'http://dev-tob-anhui-ar.aimall-tech.com'

}
if (!!!Authorization) {
    Authorization = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInZlcnNpb24iOjF9.eyJhY2NvdW50X3VpZCI6InUtY2pqZ2l0czlhcXBucTJiMmoybDAiLCJleHBpcmVkIjoxNjk5MjM0NzkxfQ.TKbphPPf3ZLjaFSej5n9jtwPJ2oI0DSJ36N-NPt_aBA'
}
const httpRequest = (url, data = {}, method = "GET", header = {
    'Authorization': Authorization
}) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: baseUrl + url,
            data: data,
            method: method,
            header: header,
            success: (res) => {
                if (res.data.err_code === 1001 && url !== '/api/m/ar/auth/wx_mp_login') {
                    // 登录授权过期
                    console.warn('登陆授权过期');
                    wx.removeStorageSync('token');
                    wx.navigateTo({
                        url: '/pages/auth/auth',
                    });
                    return reject();
                }
                resolve(res.data)
            },
            fail: (error) => {
                reject(error); // 请求失败，将错误信息传递给reject函数
            }
        });
    });
};
export const homeRecognizeYUV = (data) => {
    return httpRequest('/api/m/ar/home/quick_scan/pack_recognize_rgb', data, 'POST');
}
export const homeRecognize = (data) => {
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: baseUrl + '/api/m/ar/home/quick_scan/pack_recognize',
            name: 'image',
            filePath: data,
            header: {
                'Authorization': Authorization
            },
            success(res) {
                console.log(res, 'resres')
                if (res.data.err_code === 1001) {
                    // 登录授权过期
                    console.warn('登陆授权过期');
                    wx.removeStorageSync('token');
                    wx.navigateTo({
                        url: '/pages/auth/auth',
                    });
                    return reject();
                }
                resolve(res.data)
            },
            fail(err) {
                reject(err);
            }
        });
    });
}
export const workflow = (data) => {
    return httpRequest('/api/m/ar/home/quick_scan/workflow', data)
}
export const getArList = (data) => {
    return httpRequest(`/api/m/ar/home/sku_ar/items?pl=${data}`)

}
export const getmyworkList = (data) => {
    return httpRequest(`/api/m/ar/ugc/works${data}`)

}
export const getskuTemplates = (data) => {
    return httpRequest(`/api/m/ar/ugc/sku_templates${data}`)

}
export const getskuTemplatesList = (data) => {
    return httpRequest(`/api/m/ar/ugc/skus${data}`);
}