```js
// 封装 JSONP函数
function jsonp({ url, params, callback }) {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script');
        params = JSON.parse(JSON.stringify(params));
        let arrs = [];
        for (let key in params) {
            arrs.push(`${key}=${params[key]}`);
        }
        arrs.push(`callback=${callback}`);
        script.src = `${url}?${arrs.join('&')}`;
        document.body.appendChild(script);
        window[callback] = function (data) {
            resolve(data);
            document.body.removeChild(script);
        }
    })
}
// 前端调用
jsonp({
    url: 'http://localhost:3000/say',
    params: {
        wd: 'I Love you'
    },
    callback: 'show'
}).then(data => {
    console.log(data)
})
```