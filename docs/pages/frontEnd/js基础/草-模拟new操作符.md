```js
function myNew (Fuc, ...params) {
	let obj = {} // 不能用Object.create(null)
	obj.__proto__ = Fuc.prototype
	// 或let obj = Object.create(Fuc.prototype);
	Fuc.apply(obj, params);

	return obj
}
```
> 关于为什么不能用Object.create(null), https://github.com/mqyqingfeng/Blog/issues/13#issuecomment-316262865
> 也就是Object.create(null)生成的对象，执行obj.__proto__时，只是普通的一个__proto__属性，没有串起原型链；而obj={}的对象原本就有__proto__，是浏览器实现的，是串起了原型链的
还需要考虑2点
* 当构造函数有返回值时
* 判断一个函数是否能够作为构造函数使用
### 当构造函数有返回值时
```js
function A() {
    this.a = 1;
    return {b: 1};
}
new A(); // {b: 1}

function B() {
    this.b = 1;
    return 1;
}
new B(); // {b:1}
```
**当构造函数返回一个对象时，那么就以这个对象作为构造函数生成的对象；当构造函数返回基本类型数据时，当做没有返回值处理，内部新建个对象返回**。
因此，完善下得到
```js
function myNew (Fuc, ...params) {
	let obj = {}
	obj.__proto__ = Fuc.prototype
	// 或let obj = Object.create(Fuc.prototype);
	let result = Fuc.apply(obj, params);

	return result instanceof Object ? result : obj
}
```
### 判断一个函数是否能够作为构造函数使用

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1gdwuqqici0j312g07sq4y.jpg)
(暂时了解第一种就可以，后续在了解全的)




参考：
* https://cloud.tencent.com/developer/article/1526901

其他:模拟实现Object.create()
```js
Object.mycreate = function(proto, properties) {
    function F() {};
    F.prototype = proto;
    if(properties) {
        Object.defineProperties(F, properties);
    }
    return new F();
}
```