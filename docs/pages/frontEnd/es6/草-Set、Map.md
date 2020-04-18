### Set
类似于数组、无重复值；可以快速访问其中的数据；但**不能通过索引访问集合中的元素**

#### Set可用于数组去重(Set利用的是全等，即1与'1'不相等，因此NaN和对象无法去重)
```js
var arr = [1,2,3,4,2,1]
var a = new Set(arr)// Set类型的[1,2,3,4]
// 转为数组类型
var b = [...a] // 方案一：扩展运算符...
var c = Array.from(new Set([1,2,3,4,2,1])) // 方案二：Array.form用于将【类数组/可迭代对象】转为数组
```

#### 去除重复字符串
```js
[...new Set('ababbc')].join('')
```
#### 多个数组的并集、交集等
```js
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// 并集
let union = new Set([...a, ...b]);
// Set {1, 2, 3, 4}

// 交集
let intersect = new Set([...a].filter(x => b.has(x)));
// set {2, 3}

// 差集
let difference = new Set([...a].filter(x => !b.has(x)));
// Set {1}
```





### Map
类似于对象，也是键值对的集合；但**键的范围不仅限于字符串**，各种类型都可以作为键