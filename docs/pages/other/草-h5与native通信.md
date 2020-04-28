代码参考[云之家桥的实现](./JSBridge.js)
原理参考https://juejin.im/post/5abca877f265da238155b6bc#heading-6

## js调用native
url根据bridge的名称、参数等拼接成url
### 注入API
native将方法API注入到js的window对象下，js调用API，就执行了此API内部的native逻辑，使得native可以拿到url
### 拦截URL SCHEME
URL SCHEME是类似于url的链接，其中协议是native和js协定好的协议，名字自定义。
h5通过隐藏iframe的方式，将iframe的src设置为url，此时h5就会自动去加载url的内容，类似于浏览器向服务端发起请求，此时向native发起URL SCHEME请求，之后
native拦截并获取参数等


## native调用js
native调用js非常简单，因为h5相当于就是native的一个子组件，native直接调用其API即可。也就是js上全局注册一个接收响应的方法，native直接调用此方法，并将数据传入即可。
形如：
```js
webView.loadUrl("javascript:" + javaScriptMethod);
```

## native传回数据时，是如何找到对应的callback的呢？
采用的是类似于JSONP的机制，当js调用的时候，就会将callback生成为一个唯一的id（用一个对象维护当前所有id及其对应的callback）,并将其传给native，native返回数据时只需要将此callbackID传回来，查找到对饮的callback执行即可。