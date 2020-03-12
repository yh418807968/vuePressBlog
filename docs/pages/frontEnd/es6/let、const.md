## 块级作用域
ES6引入块级作用域的原因主要有以下2点：
* 防止内部变量覆盖外部变量
* 防止循环变量泄露为全局变量

#### 内部变量覆盖外部变量
```js
console.log(value);
if (flag) {
    var value = 1;
}
```
以上ES5代码的写法，无论flag为true还是false，value不会报错，而是打印出undefined。

这是因为var存在变量提升——提升至当前作用域顶部，而if没有单独的块级作用域，因此被提升到if的外部，可能覆盖外部变量。
#### 循环变量泄露为全局变量
```js
for (var i = 0; i < 10; i++) {
    ...
}
console.log(i); // 10
```
ES5中，使用var，即便循环已经结束了，我们依然可以访问 i 的值。

同样因为没有块级作用域，此时的i是在全局作用域下，每次循环都会改变i值（同一个全局的i），因此结束后仍然能访问到i，且值为10。
出于以上的考虑，ES6引入了块级作用域，这也是let/const与var最根本的区别。
块级作用域存在于**块中（字符 { 和 } 之间的区域）**


## let/const
let/const是实现块级作用域的一种，相比var，有如下特性。
### 不允许重复声明
```js
var value = 1;
let value = 2; // Uncaught SyntaxError: Identifier 'value' has already been declared
```
### 不绑定全局作用域
通过var在全局作用域中声明变量时，该变量会同时被添加为全局对象的属性
```js
var value = 1;
console.log(window.value); // 1
```
但let/const不会
```js
let value = 1;
console.log(window.value); // undefined
```
这样主要是为了**避免不知不觉为全局对象增加属性**
### 无变量提升，暂时性死区
这一块篇幅较大，放在另一篇文章[let/const的暂时性死区](./let、const的暂时性死区)中详细讨论。
## 循环中的块级作用域
一个老生常谈的问题，如何解决以下问题，使其输出0
```js
var funcs = [];
for (var i = 0; i < 3; i++) {
    funcs[i] = function () {
        console.log(i);
    };
}
funcs[0](); // 3
console.log(i) // 3
```
除了采用立即执行函数外，ES6的let可以解决问题
```js
var funcs = [];
for (let i = 0; i < 3; i++) {
    funcs[i] = function () {
        console.log(i);
    };
}
funcs[0](); // 0
console.log(i) // Uncaught ReferenceError: i is not defined

```
这用我们上面讲到的特性是无法解释的。
直接看[ ECMAScript 规范第 13.7.4.7 节](http://www.ecma-international.org/ecma-262/6.0/#sec-for-statement-runtime-semantics-labelledevaluation)（我还没看懂，暂时根据参考文章来理解吧），文档中对for是有专门说明，整理对我们有用的就是2点：
* `for (let i = 0; i < 3; i++)` 这句话的圆括号之间，有一个隐藏的作用域
* `for (let i = 0; i < 3; i++) { 循环体 } `在每次执行循环体之前，JS 引擎会把 i 在循环体的上下文中重新声明及初始化一次。

也就是说上面的例子可以理解为
```js
var funcs = [];
for (let i = 0; i < 3; i++) {
    let i= 隐藏作用域中的i
    funcs[i] = function () {
        console.log(i);
    };
}
funcs[0](); // 0
console.log(i) // Uncaught ReferenceError: i is not defined
```
`funcs[0]();`打印出0，是因为funcs[0]中访问的i实际上是访问了外部作用域（块级作用域的i），形成了闭包，因此能访问到外部作用域的i，最终打印出了0
`console.log(i)`报错，是因为块级作用域，内部变量不会泄露到外部，因此外部i不存在，也就更别提像var一样每次循环会修改外部i的值，最终使得打印出3的现象了。

我们可以拿下面这段代码验证下
```js
for (let i = 0; i < 3; i++) {
  let i = 'abc';
  console.log(i);
}
```
会打印出三个’abc‘，如果是用var，则只会打印出一个‘abc’。这就验证了我们所说的，
* 在循环中使用let时，圆括号之内是存在一个隐藏的作用域的，因此循环体内的`let i = 'abc';`才不会影响循环变量i，最终仍然能执行3次
* 而var由于是同一个变量，第一次循环执行后i的值就为'abc'，不满足i < 3，因此只会执行一次

### 循环中的const
```js
var funcs = [];
for (const i = 0; i < 10; i++) {
    funcs[i] = function () {
        console.log(i);
    };
}
funcs[0](); // Uncaught TypeError: Assignment to constant variable.
```
改为const会报错，是因为我们虽然每次都会在当前作用域新建一个变量，但我们会去修改隐藏作用域的i，因此会报错。

## Babel
### let转换
通过[Babel转换器](https://babeljs.io/repl)看看Babel是如何转化let的
```js
if (true) {
  console.log(value)
    let value = 1;
}
console.log(value);
```
可以看到Babel非常巧妙了转换为了
```js
if (true) {
  console.log(_value);
  var _value = 1;
}

console.log(value);
```
也就是将块级作用域的value用_value表示，使内外层的变量名称不一样，这样在ES5没有块级作用域的情况下，也可以区分内外部同名变量了。
但是注意块级作用域里的`console.log(_value)`没有变化，那这样在ES5中不就可以打印出undefined了，而不是报错'Cannot access 'value' before initialization'了？

其实**JS是在编译的时候发现在let声明前使用变量就直接给你报错，不会等到转换好后执行再报错；同样的，像 const 的修改值时报错，以及重复声明报错都是编译时直接报错。**
### 循环的转换
```js
var funcs = [];
for (let i = 0; i < 10; i++) {
    funcs[i] = function () {
        console.log(i);
    };
}
funcs[0](); // 0
```
转换为了
```js
var funcs = [];

var _loop = function _loop(i) {
  funcs[i] = function () {
    console.log(i);
  };
};

for (var i = 0; i < 10; i++) {
  _loop(i);
}

funcs[0](); // 0
```




参考：
* [ES6 系列之 let 和 const](https://github.com/mqyqingfeng/Blog/issues/82)
* [我用了两个月的时间才理解 let](https://fangyinghang.com/let-in-js/)
* 阮一峰《ES6标准入门》


