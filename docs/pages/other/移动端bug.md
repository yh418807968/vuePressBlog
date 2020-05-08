### 1、滚动穿透
【问题描述】：弹框内滚动时，会带动底部页面滚动
【思路】：不管什么方案，思路都是根据弹框的展示来动态控制底部页面的是否可滚动
```js
// 将页面设为fixed
stopBodyScroll(canScroll) {
    // canScroll为true则将底部固定，不允许滚动；为false则回复正常
    if (canScroll) { 
        this.bodyTop = window.scrollY;

        document.body.style.position = 'fixed';
        document.body.style.top = `${-this.bodyTop}px`;
    } else {
        document.body.style.position = '';
        document.body.style.top = '';

        // 回到原先的top
        window.scrollTo(0, this.bodyTop);
    }
}
```
```js
// 不允许底部滚动
stopBodyScroll(canScroll) {
    let ele = document.querySelector('body');
    if(canScroll) {
        ele.style.overflow = 'hidden';
    } else {
        ele.style.overflow = 'auto';
    }
}
```
### 2、兼容iphoneX
具体见https://juejin.im/post/5cddf289f265da038f77696c#heading-30
https://juejin.im/post/5be95fbef265da61327ed8e0
* 设置`viweport-fit`为cover
```html
<meta name="viewport" content="viewport-fit=cover">
```
* 设置安全距离

### 3、安卓软键盘顶起页面
https://blog.csdn.net/Jioho_chen/article/details/83189266
```js
fixKeyboardBug () {
    const oldHeight = window.innerHeight
    const _this = this
    window.onresize = () => {
    const newHeight = window.innerHeight
    const keyBoardHeight = oldHeight - newHeight
    _this.$refs.footer.style.bottom = `-${keyBoardHeight}px`
    }
}
```
### 4、IOS键盘自动输入验证码复制2次
方案：限制input的maxlength

### 5、canvas绘制圆形图片
```js
const imgPhoto = new Image();
imgPhoto.src = this.photoUrl
imgPhoto.onload = function(){
ctx.save();
ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
// 从画布上裁剪出这个圆形
ctx.clip();
ctx.drawImage(imgPhoto, x, y, width, height)
ctx.restore(); // 还原状态
}
```

### 6、canvas绘制图片不清晰问题
根据[文章](https://www.html.cn/archives/9297)

* 获取像素比
```js
getDevRatio (ctx) {
      let devRatio = window.devicePixelRatio || 1 // 获取设备像素比
      // ctx的像素比
      const backingStore = ctx.backingStorePixelRatio ||
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1
      return devRatio / backingStore
    },
```

注意基础知识点：

* 要设置canvas的画布大小，使用的是 canvas.width 和 canvas.height；
* 要设置画布的实际渲染大小，使用的 style 属性或CSS设置的 width 和height，只是简单的对画布进行缩放。

也就是将canvas画布放大，但是展示的渲染大小不变
```js
myCanvas.style.width = myCanvas.width + 'px';
myCanvas.style.height = myCanvas.height + 'px';
 
myCanvas.width = myCanvas.width * ratio;
myCanvas.height = myCanvas.height * ratio;
```