在`src/core/util/next-ticker.js`中

* nextTicker的实现
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gdu7qiuyanj314k0re7cc.jpg)

* 回调函数执行
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gdu7roh3n4j312a0bc41r.jpg)

* 异步更新队列
`src/core/observer/watcher.js`中
数据更新后，如果是普通的数据更新，则执行watcher队列queueWater
![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gdu7sgqy96j30eq0bo3zl.jpg)

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gdu7x0jqwvj31540u0tgr.jpg)

【注意！！】:以下两个的区别

```js
data() {
    return {
        name: '1'
    }
},
this.$nextTick(() => console.log('setter前：' + $name.innerHTML)) // !!!!此处的innerHTML值为1
this.name = '2'
this.$nextTick(() => console.log('setter后：' + $name.innerHTML))// !!!!此处的innerHTML值为2
```
```js
this.name = ' 2 '
this.$nextTick(() => console.log('setter前：' + $name.innerHTML))// !!!!此处的innerHTML值为3(因为this.name = ' 2 '时，watcher的nextTicker已经在this.$nextTick之前占了微任务的位置，所以DOM更新渲染是在this.$nextTick之前的)
this.name = ' 3 '
this.$nextTick(() => console.log('setter后：' + $name.innerHTML))// !!!!此处的innerHTML值为3
```