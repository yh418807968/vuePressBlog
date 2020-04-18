https://juejin.im/post/5e4943d0f265da57537eaba9#heading-7


Proxy对应Es5里的getter与setter
Es5里的getter和setter可以用以下几种方式定义
* 字面量
* class
* Object.defineProperty

getter和setter只能拦截对象的特定属性，而Proxy可以直接拦截整个对象

【作用】
* 日志记录 —— 当访问属性时，可以在 get 和 `set 中记录访问日志。
* 数据的双向绑定（Vue）—— 在 Vue3.0 中将会通过 Proxy 来替换原本的 Object.defineProperty 来实现数据响应式。
* 定义如何计算属性值 —— 每次访问属性值，都会进行计算属性值。