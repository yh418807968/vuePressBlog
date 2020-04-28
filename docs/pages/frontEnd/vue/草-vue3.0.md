## vue
* [12个高频问题](https://juejin.im/post/5e04411f6fb9a0166049a073#heading-16)
* [keep-alive](https://nlrx-wjc.github.io/Learn-Vue-Source-Code/BuiltInComponents/keep-alive.html#_1-%E5%89%8D%E8%A8%80)
* [nextTicker](https://segmentfault.com/a/1190000015698196)

## vue3.0
* [尤大大的ppt](https://docs.google.com/presentation/d/1yhPGyhQrJcpJI2ZFvBme3pGKaGNiLi709c37svivv0o/edit#slide=id.g31e95ee831_0_92)
* [尤大大的演讲](https://v.qq.com/x/page/k0802iqtskt.html)
* [尤大大的纪录片](https://www.ixigua.com/i6805039367925531140/)
* [vue3.0系列解析](https://juejin.im/post/5e67061de51d452713552a9f)

### 改进：
#### 更小

#### 更快
* 数据绑定策略由 Object.defineProperty() 换成了 new Proxy()
* 更多编译时优化，如：Slot 默认编译为函数
* 重构了Virtual DOM（对于静态节点，会直接跳过不会遍历，即使是动态节点在非常深的层级里）
比如在遍历这个树时，遍历到根节点后，里面智慧遍历span，第二层的div不会被遍历了
```html
<div>
    <div>
        <span>{{msg}}</span>
    </div>
</div>

```
#### 加强 TypeScript 支持
#### 加强 API 设计一致性
参考React Hooks的思想，引入Composition API，即以类似于组件模块的形式引入一个特定功能（包括data，methods）等，也就是一个模块包含自己需要的data、methods等，而不是打平写在一起。以小的函数形式被调用，更加灵活，更好维护，更好 tree-shaking
* 提高自身可维护性
optionsAPI 到composition API
#### 开放更多底层功能
* 生命周期新增了2个 Debug Hooks（用于调试的钩子函数）

onRenderTracked
onRenderTriggered
