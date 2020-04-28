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

### 安卓软键盘顶起页面
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
