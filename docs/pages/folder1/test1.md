### 一、基础Promise
#### 目标：
* 1、可以创建promise实例
* 2、执行异步代码，成功后可以执行then里的成功回调函数、失败可以执行then里的失败回调函数
#### 分析：
根据原生Promise的使用方法
```
const promise = new Promise((resolve, reject) => {
  resolve('success)
  // 或reject('fail')
})
promise.then((res) => {
  // success:doSomething
}, (err) => {
  // error:doSomething
})
```
可以知道
* 1、Promise是一个构造函数，入参是一个fn函数，fn函数的参数为2个函数：resolve和reject
* 2、promise实例的then方法，接受2个回调函数（这里定为onFulfilled, onRejected）作为参数，执行then的时候，回调函数并不执行，而是分别在resolve和reject的场景下触发
#### 实现
那我们就可以先写出一个简易版本了
```
function Promise (fn) {
  const self = this
  self.onFulfilled = null
  self.onRejected = null
  self.value = null
  self.error = null

  function resolve (value) {
    self.value = value
    self.onFulfilled()
  }
  function reject (error) {
    self.error = error
    self.onRejected()

  }
  fn(resolve, reject)
}
Promise.prototype.then = function(onFulfilled, onRejected) {
  this.onFulfilled = () => { onFulfilled(this.value) }
  this.onRejected = () => { onRejected(this.error) }
}
```
#### 测试
用setTimeout模拟异步操作
```
const promise = new Promise((resolve, reject) => {
  setTimeout(() => { // 模拟异步操作
    resolve('success')
    // 或reject('fail')
  }, 1000)

})
promise.then((res) => {
  console.log(res) // success
}, (err) => {
  console.log(err) // fail
})
```
#### 扩展一下
then方法是可以多次重复调用的，且当resolve/reject时，多个then都会执行；而我们上面的onFulfilled/onRejected都只有一个，只能执行最新的，因此我们改进一下，以满足then方法的多次调用。
只需要将回调函数改为数组就可以了。
```
function Promise (fn) {
  const self = this
  self.onFulfilledCallbacks = []
  self.onRejectedCallbacks = []
  self.value = null
  self.error = null

  function resolve (value) {
    self.value = value
    self.onFulfilledCallbacks.forEach((callback) => callback());
  }
  function reject (error) {
    self.error = error
    self.onRejectedCallbacks.forEach((callback) => callback());
  }
  fn(resolve, reject)
}
Promise.prototype.then = function(onFulfilled, onRejected) {
  this.onFulfilledCallbacks.push(() => { onFulfilled(this.value) })
  this.onRejectedCallbacks.push(() => { onRejected(this.error) })
}
```
测试下：
```
const promise = new Promise((resolve, reject) => {
		setTimeout(() => { // 模拟异步操作
			// resolve('success')
			reject('fail')
		}, 1000)
	})
	promise.then((res) => {
		console.log(res, 1) // 'success, 1'
	}, (err) => {
		console.log(err, 1) // 'fail, 1'
	})
	promise.then((res) => {
		console.log(res, 2) // 'success, 2'
	}, (err) => {
		console.log(err, 2) // 'fail, 2'
	})
```
#### 小结
如上，我们已经实现了Promise的基本功能。
then方法负责注册成功回调函数onFulfilled和失败回调函数onRejected，待成功/失败时，执行resolve/reject，从而将结果赋值给value/error，并执行onFulfilled/onRejected。

#### 二、三种状态
我们都知道，Promise有3种状态pending（进行中）、fulfilled（已成功）和rejected（已失败），通过异步请求的结果决定当前状态；状态只能由pending变为fulfilled或rejected；状态一旦改变，则不能改变也不可逆；如果状态已经改变，此时注册的then里的回调函数则会直接执行。
#### 目标
* 1、Promise有3种状态
* 2、通过异步请求的结果决定当前状态，状态只能由pending变为fulfilled或rejected，状态一旦改变，则不能改变也不可逆
* 3、如果状态已经改变，之后再调用的then方法里的回调函数则会直接执行
#### 实现
```
function Promise (fn) {
  const self = this
  self.onFulfilledCallbacks = []
  self.onRejectedCallbacks = []
  self.value = null
  self.error = null
  self.status = 'pending' // 状态初始为'pending'

  function resolve (value) {
    if (self.status === 'pending') { // 只有当状态为pending时，状态才可改变
      self.status = 'resolved' // 执行resolve将状态改变为'resolved'
      self.value = value
      self.onFulfilledCallbacks.forEach((callback) => callback())
    }
    
  }
  function reject (error) {
    if (self.status === 'pending') {
      self.status = 'rejected' // 执行resolve将状态改变为'rejected'
      self.error = error
      self.onRejectedCallbacks.forEach((callback) => callback());
    }
    
  }
  fn(resolve, reject)
}
Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.status === 'pending') { // pending时注册回调函数
    this.onFulfilledCallbacks.push(() => { onFulfilled(this.value) })
    this.onRejectedCallbacks.push(() => { onRejected(this.error) })	
  } else if (this.status === 'resolved') { // resolved时直接执行onFulfilled
    onFulfilled(this.value)
  } else { // rejected时直接执行onRejected
    onRejected(this.error)
  }	
}
```
目标1的实现：变量status来表示状态
目标2的实现：只有resolve函数和reject函数可以改变status的值，且只有当status为pending时才可改变（且只能变为fulfilled或rejected），这样同时可满足状态一旦改变，便无法再被改变
目标3的实现：then方法里只有状态为pending时是注册保存回调函数，resolved/rejected下则直接执行回调函数。
#### 测试
```
const promise = new Promise((resolve, reject) => {
  setTimeout(() => { // 模拟异步操作
    resolve('success')
    reject('fail')
  }, 1000)
})
promise.then((res) => {
  console.log(res, 1)
}, (err) => {
  console.log(err, 1)
})
setTimeout(() => { // 等1s的resolve执行后再调用then方法
  promise.then((res) => {
    console.log(res, 2)
  }, (err) => {
    console.log(err, 2)
  })
}, 2000)
```
输出结果为：
```
1s: success, 1
2s: success, 2
```
没有输出fail，说明状态一旦改变为resolved了，便不能再被改变了（没有改变为rejected）;2s时，此时状态已经改变为resolved，直接执行回调函数，输出"success, 2"。

### then异步执行
使用过Promise的话就都知道，根据js的执行机制，then方法里的回调函数并不是同步执行的，而是一个微任务，等到当前循环的同步任务执行完了才会被执行。
测试下
```
const promise = new Promise((resolve, reject) => {
  setTimeout(() => { // 模拟异步操作
    resolve('success')
  }, 1000)
})
promise.then((res) => {
  console.log(res)
}, (err) => {
  console.log(err)
})
console.log('script end')
```
用我们以上的实现来验证，好像是对的，先输出'script end'然后输出'success'，但仔细想想，这里'success'后输出，只是因为异步任务1s后才完成，因此resolve1s后才执行，也就是then里的回调函数1s后才执行。这与then方法是不是以微任务的形式实现的完全没什么关系，我们来验证下
```
const promise = new Promise((resolve, reject) => {
  resolve('success')
})
promise.then((res) => {
  console.log(res)
}, (err) => {
  console.log(err)
})
console.log('script end')
```
把异步任务改为同步，此时就会先输出'success'然后'script end'，这显然和原生Promise的表现不一样。
因此我们要保证不管是异步任务还是同步任务，then里的回调都是异步执行的。
#### 实现
原生Promise的then里的回调是微任务，这里暂时用宏任务setTimeout来实现模拟下，后面会讲到如何修改。
```
Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.status === 'pending') { // pending时注册回调函数
    this.onFulfilledCallbacks.push(() => {
      setTimeout(() => { 
        onFulfilled(this.value)
      })
    })
    this.onRejectedCallbacks.push(() => { 
      setTimeout(() => { 
        onRejected(this.error)
      })
    })	
  } else if (this.status === 'resolved') { // resolved时直接执行onFulfilled
    setTimeout(() => { 
      onFulfilled(this.value)
    })
  } else { // rejected时直接执行onRejected
    setTimeout(() => { 
      onRejected(this.error)
    })
  }	
}
```
只需要将在then方法里的回调函数加上setTimeout，即可实现异步执行。
#### 测试
直接用以上提到的测试用例，结果是先输出'script end'然后输出'success'，符合预期。
#### 小结
此时我们实现的Promise已经能满足日常大部分的使用场景了。接下来，我们主要来看看Promise的链式调用，这也是Promise的主要特色，通过链式调用避免回调地狱。
### 链式调用
提到链式，可能第一反应就是想到通过再then方法里返回this来实现，Jquery就是这么实现的，但是Promise的链式调用有些不一样。
如果then方法里返回this，则前一个then方法的回调函数执行后，状态已经改变；由于返回的this，即同一个promise实例，则下一个then就会直接执行
```
Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.status === 'pending') { // pending时注册回调函数
    this.onFulfilledCallbacks.push(() => {
      setTimeout(() => { 
        onFulfilled(this.value)
      })
    })
    this.onRejectedCallbacks.push(() => { 
      setTimeout(() => { 
        onRejected(this.error)
      })
    })	
  } else if (this.status === 'resolved') { // resolved时直接执行onFulfilled
    setTimeout(() => { 
      onFulfilled(this.value)
    })
  } else { // rejected时直接执行onRejected
    setTimeout(() => { 
      onRejected(this.error)
    })
  }
  return this
}
```
```
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success-1')
  }, 1000)
})
promise.then((res) => {
  console.log(res, 1)
  return 'success-2'
}).then((res) => {
  console.log(res, 2)
})
```
输出结果为
```
success-1 1
success-1 2
```
执行第二个then里的回调函数时，状态已经改变，会直接执行；输出结果没有出现第一个then里返回的success-2，因为此时返回的还是实例promise，此时的self.value是'success-1'，'success-2'会被忽略掉。
想要第二个then能获取到第一个then的返回值，需要第一个then返回一个新的thenable对象，这里我们返回一个新的Promise实例。





