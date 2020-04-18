## this
this是与执行上下文绑定的，每个执行上下文都有一个this；执行上下文有3种：全局执行上下文、函数执行上下文和eval执行上下文，因此this也有3种，全局执行上下文中的this、函数执行上下文中的this和eval执行上下文中的this。eval我们很少使用，因此这里我们只讨论全局执行上下文中的this、函数执行上下文中的this。
## 全局执行上下文的this
在全局执行上下文中，this指向全局对象，因此在浏览器环境中，this指向window。
## 函数执行上下文的this
函数执行上下文的this有些复杂，主要是因为它与作用域不同，**不是静态绑定到一个函数的，而是与函数如何被调用有关**，也就是说一个函数每次的this可能不一样。
> 这里尤其要记住，不要混淆作用域和this，这两者可以说没有任何关系，作用域是在函数定义时就确定的，而this是在函数调用时确定的。

JavaScript中共有以下4种函数调用方式：
* 对象调用方法方式；
* 函数调用方式；
* apply/call方式；
* 构造函数方式；

### 对象调用方法方式
当一个函数被保存为对象的一个属性时，我们称此函数为方法。**使用对象来调用其内部的一个方法，该方法的 this 是指向对象本身的**
```js
var obj ={
  value:3,
  dosth:function(){
    return this.value;//通过obj.do()调用时，this指向obj
  }
}
console.log(obj.dosth());//3
```
### 函数调用方式
当一个函数并非一个对象的属性时，那么它就是被当做一个函数来调用的。此时，**相当于再全局环境中调用此函数，this指向全局对象** 。
```js
var dosth = function(){
  return this.value;
}
console.log(dosth());//undefined
var value= 2;
console.log(dosth());//2
```
### 通过call/apply方式
apply/call是最直观的可以看出this指向的调用模式，**在apply/call中指定的第一个参数就是要绑定给this的值**
```js
var value = 2;
var obj ={value:3}
obj.double = function(){
  var helper = function(){
    this.value = this.value*2;
  }
 helper.call(obj);//改变调用方式
}
obj.double();
console.log("obj的value值为:"+obj.value+",window的value值为:"+value);//obj的value值为:6,window的value值为:2
```
>不过要注意，在非严格模式下，当第一个参数为null或undefined时，this将指向window。

### 构造函数方式
当一个函数采用new操作符调用时，它就称为构造函数。也就是说，构造函数只是普通函数，只是在new的那一刻，其被成为构造函数。通过new操作符调用一个函数时，new操作符背后干了4件事：

* 创建一个空对象obj
* 将obj的原型指向构造函数（这样obj就可以访问到构造函数原型中的属性）
* 使用call，改变构造函数this的指向到obj，并执行构造函数代码（这样obj就可以访问到构造函数中的属性）
* 返回新对象

因此，**构造函数中的this就是新对象本身**。
## 嵌套函数中的this不会从外层函数中继承
这可以算是一个JavaScript的设计问题，也就是当采用上文提到的第2种调用方式——函数调用方式时，this始终指向window，这会导致内部函数调用时this无法指向外部函数的this（很多情况下我们是希望指向外部函数的this）。
```js
var value = 2;
var obj ={value:3}
obj.double = function(){
  var helper = function(){
    this.value = this.value*2;
  }
  helper();
}
obj.double();
console.log("obj的value值为:"+obj.value+",window的value值为:"+value);//obj的value值为:3,window的value值为:4
```
可以发现，执行了obj.double()后，obj.value值并没有变化，而全局变量value的值*2了。因为helper虽然在obj.double内部，但其采用函数模式调用时，this指向的是window而不是obj。

解决这个问题也很简单：
* 方案一：将this赋值给其他变量保存
```js
var value = 2;
var obj ={value:3}
obj.double = function(){
  var that = this;//将this赋值给that
  var helper = function(){
    that.value = that.value*2;
  }
  helper();
}
obj.double();
console.log("obj的value值为:"+obj.value+",window的value值为:"+value);//obj的value值为:6,window的value值为:2
```
此方法采用一个变量that来保存this，这样helper函数里使用that时其实就与this无关了，就是在使用一个普通的变量。其实，这个方法的的本质是**把 this 体系转换为了作用域的体系**
* 方案二：Es6的箭头函数
```js
var value = 2;
var obj ={value:3}
obj.double = function(){
  var helper = () => {
    this.value = this.value*2;
  }
  helper();
}
obj.double();
console.log("obj的value值为:"+obj.value+",window的value值为:"+value);//obj的value值为:6,window的value值为:2
```
ES6中的箭头函数并不会创建其自身的执行上下文，所以箭头函数中的this取决于它的外部函数

