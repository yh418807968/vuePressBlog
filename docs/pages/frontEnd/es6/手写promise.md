## 基础Promise
### 目标：
* 1、可以创建promise实例
* 2、执行异步代码，成功后可以执行then里的成功回调函数、失败可以执行then里的失败回调函数
### 分析：
根据原生Promise的使用方法
```js
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
### 实现
那我们就可以先写出一个简易版本了
```js
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
### 测试
用setTimeout模拟异步操作
```js
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
### 扩展一下
then方法是可以多次重复调用的，且当resolve/reject时，多个then都会执行；而我们上面的onFulfilled/onRejected都只有一个，只能执行最新的，因此我们改进一下，以满足then方法的多次调用。
只需要将回调函数改为数组就可以了。
```js
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
```js
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
### 小结
如上，我们已经实现了Promise的基本功能。
then方法负责注册成功回调函数onFulfilled和失败回调函数onRejected，待成功/失败时，执行resolve/reject，从而将结果赋值给value/error，并执行onFulfilled/onRejected。

## 三种状态
我们都知道，Promise有3种状态pending（进行中）、fulfilled（已成功）和rejected（已失败），通过异步请求的结果决定当前状态；状态只能由pending变为fulfilled或rejected；状态一旦改变，则不能改变也不可逆；如果状态已经改变，此时注册的then里的回调函数则会直接执行。
### 目标
* 1、Promise有3种状态
* 2、通过异步请求的结果决定当前状态，状态只能由pending变为fulfilled或rejected，状态一旦改变，则不能改变也不可逆
* 3、如果状态已经改变，之后再调用的then方法里的回调函数则会直接执行
### 实现
```js
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
### 测试
```js
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

## then异步执行
使用过Promise的话就都知道，根据js的执行机制，then方法里的回调函数并不是同步执行的，而是一个微任务，等到当前循环的同步任务执行完了才会被执行。
测试下
```js
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
```js
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
### 实现
原生Promise的then里的回调是微任务，这里暂时用宏任务setTimeout来实现模拟下，后面会讲到如何修改。
```js
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
### 测试
直接用以上提到的测试用例，结果是先输出'script end'然后输出'success'，符合预期。
### 小结
此时我们实现的Promise已经能满足日常大部分的使用场景了。接下来，我们主要来看看Promise的链式调用，这也是Promise的主要特色，通过链式调用避免回调地狱。
## 链式调用
提到链式，可能第一反应就是想到通过再then方法里返回this来实现，Jquery就是这么实现的，但是Promise的链式调用有些不一样。
如果then方法里返回this，则前一个then方法的回调函数执行后，状态已经改变；由于返回的this，即同一个promise实例，则下一个then就会直接执行
```js
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
```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success-1')
  }, 1000)
})
promise.then((res) => {
  console.log(res)
  return 'success-2'
}).then((res) => {
  console.log(res)
})
```
输出结果为
```
success-1
success-1
```
执行第二个then里的回调函数时，状态已经改变，会直接执行；输出结果没有出现第一个then里返回的success-2，因为此时返回的还是实例promise，此时的self.value是'success-1'，'success-2'会被忽略掉。
想要第二个then能获取到第一个then的返回值，需要第一个then返回一个新的thenable对象，这里我们返回一个新的Promise实例。
### 实现
```js{2,7,13}
Promise.prototype.then = function(onFulfilled, onRejected) {
  return new Promise ((resolve, reject) => {
    if (this.status === 'pending') { // pending时注册回调函数
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => { 
            const x = onFulfilled(this.value) // 回调函数的返回值x
            resolve(x) // 将resolve返回值x，即将x做为返回的promise实例的value，也即下一个then的回调函数的入参
          })
        })
        this.onRejectedCallbacks.push(() => { 
          setTimeout(() => { 
            const x = onRejected(this.error)
            resolve(x) // !特别注意！：这里执行了失败回调函数的返回值，仍然是resolve，不是reject
          })
        })	
    } else if (this.status === 'resolved') {
      setTimeout(() => { 
        const x = onFulfilled(this.value)
        resolve(x)
      })
    } else {
      setTimeout(() => { 
        const x = onRejected(this.error)
        resolve(x)
      })
    }
  })
}
```
只需要将返回的this改为一个Promise实例，并通过`resolve(回调函数的返回值x)`将x传递给下一个then即可。
### 测试
还是刚刚的例子，此时返回结果为
```
success-1
success-2
```
此时第一个then的返回值已经被第二个then接受到。
要特别说明一点，以上的实现中newPromise的状态不能因为上一个promise被reject了，也reject；也就是说上一个promise无论被 reject 还是被 resolve ， newPromise 都会被 resolve，只有newPromise出现异常时才会被 reject。我们测试下
```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('fail')
  }, 1000)
})
promise.then((res) => {
  console.log('success-1:', res)
  return 'test'
}, (err)=> {
  console.log('fail-1:', err)
  return 'test'
}).then((res) => {
  console.log('success-2:', res)
}, (err) => {
  console.log('fail-2:', err)
})
```
结果如下：
```
fail-1: fail
success-2: test
```
也就是第一个Promise里的reject是进入失败回调函数，输出'fail-1'，然后失败回调函数里返回了test，此时就是新的Promise实例的返回，是resolve状态，因此进入了下一个then的成功回调函数，输出'success-2'。
## 异常处理
以上我们已经实现了Promise的链式调用，只要正常使用没啥问题，但如果使用时出现错误，错误得不到处理，就会报错。
```js
const promise = new Promise((resolve, reject) => {
  throw new Error('error')
})
promise.then((value) => {
    console.log('success:', value)
}, (err)=>{
    console.log('reject:', err)
})
```
以上会报错，也就是错误没有被处理，我们的Promise面对异常情况还十分脆弱。所以我们要对异常情况做下处理。
构造函数中
```js
function Promise (fn) {
  // code...(省略其他代码)
  try {
    fn(resolve, reject)
  } catch (e) {
    reject(e)
  }
}
```
then方法中
```js
Promise.prototype.then = function(onFulfilled, onRejected) {
  return new Promise ((resolve, reject) => {
    if (this.status === 'pending') { // pending时注册回调函数
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => { 
            try {
              const x = onFulfilled(this.value) // 回调函数的返回值x
              resolve(x) // 将resolve返回值x，即将x做为返回的promise实例的value，也即下一个then的回调函数的入参
            } catch (e) {
              reject(e)
            }
            
          })
        })
        this.onRejectedCallbacks.push(() => { 
          setTimeout(() => { 
            try {
              const x = onRejected(this.error)
              resolve(x) // 特别注意：这里执行了失败回调函数的返回值，仍然是resolve，不是reject
            } catch (e) {
              reject(e)
            }
            
          })
        })	
    } else if (this.status === 'resolved') {
      setTimeout(() => { 
        try {
          const x = onFulfilled(this.value)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    } else {
      setTimeout(() => { 
        try {
          const x = onRejected(this.error)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    }
  })
}
```
此时再测试下上面的例子，错误被捕获了，也就是此时对于我们的Promise就具备异常处理的能力了。

## 值穿透
看下这个例子
```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
promise.then().then(1).then((res) => {
  console.log('success:' res)
}, (err)=>{
  console.log('reject:', err)
})
```
按目前的实现，会报错'onRejected is not a function'，因为then无法处理非函数的传参，但是采用原生Promise会输出'success:success'，这是因为原生Promise支持了值穿透。简单来说，就是then方法里不传成功/失败回调函数时，就直接忽略传参，默认直接返回value。
> 说明下，为什么不是报错'onFulfilled is not a function'。实际上'onFulfilled is not a function'的错误也报了，只是在then里push回调函数时，onRejected在后面，所以最终打印出了后面抛出的错误。
```js
Promise.prototype.then = function(onFulfilled, onRejected) {
  // onFulfilled/onRejected如果不是函数，就忽略onFulfilled/onRejected，直接返回value/抛出错误
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
  return new Promise ((resolve, reject) => {
    if (this.status === 'pending') { // pending时注册回调函数
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => { 
            try {
              const x = onFulfilled(this.value) // 回调函数的返回值x
              resolve(x) // 将resolve返回值x，即将x做为返回的promise实例的value，也即下一个then的回调函数的入参
            } catch (e) {
              reject(e)
            }
            
          })
        })
        this.onRejectedCallbacks.push(() => { 
          setTimeout(() => { 
            try {
              const x = onRejected(this.error)
              resolve(x) // 特别注意：这里执行了失败回调函数的返回值，仍然是resolve，不是reject
            } catch (e) {
              reject(e)
            }  
          })
        })	
    } else if (this.status === 'resolved') {
      setTimeout(() => { 
        try {
          const x = onFulfilled(this.value)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    } else {
      setTimeout(() => { 
        try {
          const x = onRejected(this.error)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    }
  })
}
```
### 测试
此时再测试上面的例子，就会输出'success:success'了。

## resolvePromise
Promise的规范规定，resolve能处理各种类型的值，包括Promise实例，将其处理成普通值fulfilled或者直接rejected。显然我们目前的resolve还只能处理基本类型的值，而能处理Promise对象这一能力在日常使用中非常有必要。我们先来模拟一个日常的使用场景。
```js
let p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(0)
  }, 1000)
})
let f1 = function(data) {
  console.log(data)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  });
}
let f2 = function(data) {
  console.log(data)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2)
    }, 1000)
  });
}
let f3 = function(data) {
    console.log(data);
}
p.then(f1).then(f2).then(f3)
```
用setTimeout来模拟异步任务。以上场景就是f1依赖p的结果、f2依赖f1、f3依赖f2，预期是想要间隔一秒按顺序输出0, 1, 2，但按目前的实现，会在1s的时候同时输出
```js
0
Promise { status: 'pending',
  value: null
  error: null,
  onRejectedCallbacks: [],
  onResolvedCallbacks: []
}
Promise { status: 'pending',
  value: null
  error: null,
  onRejectedCallbacks: [],
  onResolvedCallbacks: []
}
```
和预期的不一样，前面then返回的Promise实例直接被传递给下一个then了。我们需要针对这种情况做下处理。
### 目标
* 1、能处理非基本类型值的resolve函数
* 2、如果resolve的传参是Promise实例对象，则要将此实例对象的返回值传递到外层
### 实现
首先，新增一个函数fulfill，该函数只是一个Promise状态改变器。状态改变后，使用传进来的普通值，调用回调数组里面的回调函数。
resolve函数用于处理传入的参数，将传入的参数处理为一个基本类型，并根据处理的情况，决定调用fulfill还是reject来改变状态。
```js
function resolve(value) {
  resolvePromise(self,value,fulfill,reject)
}

function fulfill (value) {
  if (self.status === 'pending') { // 只有当状态为pending时，状态才可改变
    self.status = 'resolved' // 执行resolve将状态改变为'resolved'
    self.value = value
    self.onFulfilledCallbacks.forEach((callback) => callback())
  }
}
```
然后实现resolvePromise
```js
function resolvePromise(promise, x, fulfill, reject) {
  if (promise === x) {//传进来的x与当前promise相同，报错
    return reject(new TypeError('循环引用了'))
  } 
  // x如果是一个promise
  if (x instanceof Promise) {
    if (x.status === 'pending') { // x状态还未改变，返回的下一个promise的resove的接收的值y不确定，对其递归处理
      x.then((y) => {
          resolvePromise(promise, y, fulfill, reject)
      }, reject)
    } else {
      //状态确定，如果fulfill那传进来的肯定是普通值，如果reject直接处理，不管你抛出来的是什么
      x.then(fulfill, reject)
    }
  } else {
    fulfill(x)
  }
}
```
这一段不太好理解，要多看看多想想。主旨就是通过递归调用的方式，将里层的返回值传到外层，实现的方式就是通过then，因为每执行一次then相当于脱掉一层promise的外壳。
### 测试
再试下以上的例子，就是每次一秒依次输出0, 1, 2了。
为了更好的理解，我们可以改下例子中的f1（日常使用场景不会这样用，只是为了说明问题）
```js
let f1 = function(data) {
  console.log(data)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(1)
        }, 1000)
      }))
    }, 1000)    
  })
}
```
会发现即使多了一层Promise，依然是每次一秒依次输出0, 1, 2。也就是说resolvePromise最本质的作用，就是脱去参数的一层层Promise外壳，直接将最里层的普通出传递出来。
> resolvePromise要更完善，应该还要对所有类型都处理，这里只对Promise做了处理，这也是resolvePromise最大的作用，其他边边角角的处理，我就暂时没研究，后面测试部分会直接给出完成代码。
## 宏任务vs微任务
这里不就宏任务和微任务展开说明了，涉及到js的执行机制，网上很多文章。
直接说问题：原生Promise是微任务，但我们实现的时候是采用setTimeout来实现的，属于宏任务。
```js
setTimeout(()=>{
  console.log(5)
})
const promise = new Promise((resolve,reject)=>{
  console.log(1)
  resolve(3)
})
promise.then((value)=>{
  console.log(value)  
})
console.log(2)
```
输出结果为
```
1
2
5
3
```
但原生Promise的结果是
```
1
2
3
5
```
这是因为当我们用setTimeout（宏任务）去实现Promise时，`setTimeout(()=>{console.log(5)})`就和then里的回调函数都是宏任务，`setTimeout(()=>{console.log(5)})`先加入队列，因此先输出。但是原生Promise是微任务，当执行完同步任务后，会先执行then的微任务，再去执行宏任务`setTimeout(()=>{console.log(5)})`。
因此，要将setTimeout替换为微任务方法。微任务方法有process.nextTick, Promise（原生 Promise）, Object.observe, MutationObserver。浏览器环境可以使用MutationObserver，node环境可以使用process.nextTick，这里简单起见，采用process.nextTick。
直接将setTimeout改为nextTick，输出结果即为
```
1
2
3
5
```
## 完整代码
### 完善resolvePromise
resolvePromise除了要能应对基本类型和Promise，还要应对其他可能的类型，这里直接给出[深究Promise的原理及其实现](!https://github.com/yonglijia/JSPI/blob/master/How%20to%20implement%20a%20Promise.md)中的实现。
```js
function resolvePromise(promise,x,fulfill,reject) {

  if (promise === x) {//2.3.1 传进来的x与当前promise相同，报错
    return reject(new TypeError('循环引用了'))
  }

  //2.3.2 x如果是一个promise
  if (x instanceof Promise) {
    //2.3.2.1
    if (x.status === 'pending') { //x状态还未改变，返回的下一个promise的resove的接收的值y不确定，对其递归处理
      x.then(function(y) {
        resolvePromise(promise, y, fulfill, reject)
      },reject)
    } else {
      //2.3.2.2 ,  2.3.2.3
      //状态确定，如果fulfill那传进来的肯定是普通值，如果reject直接处理，不管你抛出来的是什么东东
      x.then(fulfill, reject)
    }
    return;
  }
  let called = false;
  //2.3.3
  //x 是一个thenable
  if(x !== null && (typeof x === 'object' || typeof x === 'function')){
    try {
        //2.3.3.1
        let then = x.then;
        if (typeof then === 'function') {//2.3.3.3  {then:: (resolve,reject)=>{resolve(1)}}}
          then.call(x,(y)=>{
            if (called) return
            called = true
            resolvePromise(promise,y,fulfill,reject)
          },(err)=>{
            if (called) return
            called = true
            reject(err)
          })
        }else{//2.3.3.2   x: {then:1}，是一个带then属性的普通值
          fulfill(x)
        }
    }catch(e){//2.3.3.2  可以参见上面说的异常情况2
      if (called) return
      called = true;
      reject(e);
    }
  } else {//2.3.3.4,x是一个普通值
    fulfill(x)
  }
}
```
### 完整代码
```js
function Promise (fn) {
  const self = this
  self.onFulfilledCallbacks = []
  self.onRejectedCallbacks = []
  self.value = null
  self.error = null
  self.status = 'pending' // 状态初始为'pending'
  function resolve(value) {
      resolvePromise(self,value,fulfill,reject)
  }

  function fulfill (value) {
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
    try {
      fn(resolve, reject)
    } catch (e) {
      reject(e)
    }
}
Promise.prototype.then = function(onFulfilled, onRejected) {
  // onFulfilled/onRejected如果不是函数，就忽略onFulfilled/onRejected，直接返回value/抛出错误
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
  return new Promise ((resolve, reject) => {
    if (this.status === 'pending') { // pending时注册回调函数
        this.onFulfilledCallbacks.push(() => {
          process.nextTick(() => { 
            try {
              const x = onFulfilled(this.value) // 回调函数的返回值x
              resolve(x) // 将resolve返回值x，即将x做为返回的promise实例的value，也即下一个then的回调函数的入参
            } catch (e) {
              reject(e)
            }
            
          })
        })
        this.onRejectedCallbacks.push(() => { 
          process.nextTick(() => { 
            try {
              const x = onRejected(this.error)
              resolve(x) // 特别注意：这里执行了失败回调函数的返回值，仍然是resolve，不是reject
            } catch (e) {
              reject(e)
            }
            
          })
        })	
    } else if (this.status === 'resolved') {
      process.nextTick(() => { 
        try {
          const x = onFulfilled(this.value)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    } else {
      process.nextTick(() => { 
        try {
          const x = onRejected(this.error)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    }
  })
}
function resolvePromise(promise,x,fulfill,reject) {

  if (promise === x) {//2.3.1 传进来的x与当前promise相同，报错
    return reject(new TypeError('循环引用了'))
  }

  //2.3.2 x如果是一个promise
  if (x instanceof Promise) {
    //2.3.2.1
    if (x.status === 'pending') { //x状态还未改变，返回的下一个promise的resove的接收的值y不确定，对其递归处理
      x.then(function(y) {
        resolvePromise(promise, y, fulfill, reject)
      },reject)
    } else {
      //2.3.2.2 ,  2.3.2.3
      //状态确定，如果fulfill那传进来的肯定是普通值，如果reject直接处理，不管你抛出来的是什么东东
      x.then(fulfill, reject)
    }
    return;
  }
  let called = false;
  //2.3.3
  //x 是一个thenable
  if(x !== null && (typeof x === 'object' || typeof x === 'function')){
    try {
        //2.3.3.1
        let then = x.then;
        if (typeof then === 'function') {//2.3.3.3  {then:: (resolve,reject)=>{resolve(1)}}}
          then.call(x,(y)=>{
            if (called) return
            called = true
            resolvePromise(promise,y,fulfill,reject)
          },(err)=>{
            if (called) return
            called = true
            reject(err)
          })
        }else{//2.3.3.2   x: {then:1}，是一个带then属性的普通值
          fulfill(x)
        }
    }catch(e){//2.3.3.2  可以参见上面说的异常情况2
      if (called) return
      called = true;
      reject(e);
    }
  } else {//2.3.3.4,x是一个普通值
    fulfill(x)
  }
}
```
## 验证我们的代码
步骤：
1、在后面加上下述代码
2、npm 有一个promises-aplus-tests插件 npm i promises-aplus-tests -g 全局安装
3、命令行 promises-aplus-tests [js文件名] 即可验证
```js
Promise.deferred = Promise.defer = function () {
  var dfd = {}
  dfd.promise = new Promise(function (resolve, reject) {
      dfd.resolve = resolve
      dfd.reject = reject
  })
  return dfd
}
module.exports = Promise
```
如图，全部通过啦！
(![](https://tva1.sinaimg.cn/large/00831rSTgy1gcpzzitfwvj30ve0mi41d.jpg))
## 其他方法
有了上面的理解，其他方法也就很好实现，也很好理解了。
```js
Promise.prototype.catch = function(callback){ 
  return this.then(null,callback)
}
Promise.resolve = function(value){ //返回一个promise
  return new Promise(function(resolve,reject){
      resolve(value);
  })
}
Promise.reject = function(value){//返回一个promise
  return new Promise(function(resolve,reject){
      reject(value);
  })
}
Promise.race = function(promises){//只要有一个成功了就resolve,有一个失败了就reject
  return new Promise(function (resolve,reject){
      for(var i = 0;i<promises.length;i++){
          promise[i].then(resolve,reject)
      }
  })
}
Promise.all = function(promises){ //所有的都成功了resolve，有一个失败了就reject
  return new Promise(function(resolve,reject){
    let resultArr = [];
    let times = 0;
    function processData(index,y){
      resultArr[index]= y;
      if(++times === promises.length){
          resolve(resultArr)
      }
    }
    for(var i = 0;i<promises.length;i++){
      promises[i].then(function(y){
          processData(i,y)
      },reject)
    }
  })
}
```


参考:
* [深究Promise的原理及其实现](https://github.com/yonglijia/JSPI/blob/master/How%20to%20implement%20a%20Promise.md)
* [一起学习造轮子（一）：从零开始写一个符合Promises/A+规范的promise](https://juejin.im/post/5b16800fe51d4506ae719bae#heading-5)











