## 暂时性死区的表现
```js
if (true) {
    console.log(value);//VM58:2 Uncaught ReferenceError: Cannot access 'value' before initialization
    let value = 1;
}
```
进入当前作用域，在变量声明之前访问变量，是无法访问到的。
这是由于let/const没有变量提升（提升到作用域顶部），因此通过let/const定义的变量不会被提升到作用域顶部——也就是此时的块级作用域，因此在声明之前无法访问。
但是**为什么报错信息是“Cannot access 'value' before initialization”**，而不是我们常见的“value is not defined”呢，这两者有啥区别？
比如以下代码，由于块级作用域，外部是没有value声明的，所以会报错“value is not defined”
```js
if (false) {
    let value = 1;
}
console.log(value);//Uncaught ReferenceError: value is not defined
```
## 原因排查
我们通过控制台的作用域来看看
```js
if (true) {
	debugger
    let value = 1;
}
```
![](https://tva1.sinaimg.cn/large/0082zybpgy1gca6vymoxjj30y80fyq5k.jpg)
从上图可以看到，控制台的Block作用域里value已经存在了，说明value肯定是被定义了，因此肯定不会报错“value is not defined”，但是又不法访问，原因是当前时刻为“before initialization”。
**那也就是“defined”和“initialization”是有区别的？**
## 我这样理解
为了理解以上现象，
参考文章[我用了两个月的时间才理解 let](https://fangyinghang.com/let-in-js/)，我们可以把 JS 变量分为「创建create、初始化initialize 和赋值assign」3个步骤。
### var 声明的「创建、初始化和赋值」过程
```js
if (true) {
    console.log(x, y) // undefined,undefined
    var x = 1
    var y = 2
}
```
执行上述代码时，会有如下步骤：
* 找到代码块中所有用 var 声明的变量，在这个环境中「创建」这些变量（即 x 和 y）。
* 将这些变量「初始化」为 undefined。
* 开始执行代码
x = 1 将 x 变量「赋值」为 1
y = 2 将 y 变量「赋值」为 2
也就是**var在执行赋值操作之前，就将「创建变量，并将其初始化为 undefined」**。因此通过var声明变量之前，在同一作用域下访问变量，得到的是undefined。

### function的「创建、初始化和赋值」过程
```js
fn()
function fn(){
  console.log(1)
}
```
执行上述代码时，会有如下步骤：

* 找到代码中的function声明的变量，在这个环境中「创建」这些变量
* 将这些变量「初始化」并「赋值」为function `fn(){console.log(1)}`
* 开始执行代码fn

也就是说 function 声明会在代码执行之前就「创建、初始化并赋值」。
### let 声明的「创建、初始化和赋值」过程
```js
if (true) {
    console.log(x, y) // Cannot access 'value' before initialization
    let x = 1
    let y = 2
}
```
* 找到所有用 let 声明的变量，在环境中「创建」这些变量
* 开始执行代码（注意现在还没有初始化）
* 执行let x = 1，将 x 「初始化」，并「赋值」为 1（let x 实现初始化，x = 1实现赋值）
* 对let y = 2实现相同的步骤

### 无变量提升
从以上分析来看，
* 我们平常所说的“变量提升“其实是指将「创建」和「初始化」这2个步骤都提升了
* var存在变量提升，因为其同时提升了「创建」和「初始化」；
* function存在变量提升，因为其同时提升了「创建」、「初始化」和「赋值」；
* let/const不存在变量提升，实际上是因为**let/const只提升了「创建」，而没有提升「初始化」**。

同时，上面的报错也很好理解了：
* “value is not defined”是因为变量没有「创建」
* “Cannot access 'value' before initialization”是「创建」了变量，但没「初始化」

因此，**所谓暂时性死区，就是不能在初始化之前使用变量。**

## 需要暂时性死区的原因
ES6增加暂时性死区这一特性，主要是为了**减少运行时错误，防止声明之前就使用**。

但是为什么不直接将「创建」过程也不提升呢？

我的理解是由于js是静态作用域，在代码编译的时候就会去分析各作用域的变量对象，因此「创建」过程一定是在代码执行前完成，也就是一定会被提升，那为了防止大家在声明之前就使用，就在「初始化」上做文章了，没有讲「初始化」不提升，这样就不能在声明之前使用了。

参考:
* [我用了两个月的时间才理解 let](https://fangyinghang.com/let-in-js/)

* 阮一峰《ES6标准入门》