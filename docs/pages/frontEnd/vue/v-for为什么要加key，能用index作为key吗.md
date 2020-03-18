## 前言
在vue中使用v-for时，一直有几个疑问：
* v-for为什么要加key
* 为什么有时候用index作为key会出错

带着这个疑问，结合各种博客和源码，终于有了点眉目。

## virtual dom
要理解diff的过程，先要对virtual dom有个了解，这里简单介绍下。

**作用**

我们都知道重绘和回流，回流会导致dom重新渲染，比较耗性能；而virtual dom就是用一个对象去代替dom对象，当有多次更新dom的动作时，不会立即更新dom，而是将变化保存到一个对象中，最终一次性将改变渲染出来。

**形式**
```html
<div>
    <p></p>
    <span></span>
</div>
```
以上代码转换成virtual dom就是如下形式（当然省去了很多其他属性）
```js
{
    tag: 'div',
    children: [
        {
            tag: 'p'
        },
        {
            tag: 'span'
        }
    ]
}
```

## diff原理
首先当然是附上这张经典的图
![](http://ww1.sinaimg.cn/large/006tNc79gy1g5tfbkauu3j30ah05jmxk.jpg)

图中很清楚的说明了，diff的比较过程只会在同层级比较，不会跨级比较。

整体的比较过程可以理解为一个层层递进的过程，每一级都是一个vnode数组，当比较其中一个vnode时，若children不一样，就会进入updateChildren函数（其主要入参为newChildren和oldChildren，此时newChildren和oldChildren为同级的vnode数组）；然后逐一比较children里的节点，对于children的children，再循环以上步骤。

updateChildren就是diff最核心的算法，源码如下（简要了解就行）：
```js
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
    } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
            idxInOld = isDef(newStartVnode.key)
                ? oldKeyToIdx[newStartVnode.key]
                : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
            vnodeToMove = oldCh[idxInOld]
            if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
            } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
            }
        }
        newStartVnode = newCh[++newStartIdx]
        }
    }
    if (oldStartIdx > oldEndIdx) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
```
diff算法是一个交叉对比的过程，大致可以简要概括为：头头比较、尾尾比较、头尾比较、尾头比较、单个新子节点在旧子节点数组中查找位置。具体过程可以参见[这篇博文](https://www.jianshu.com/p/cd39cf4bb61d)，里面用例子讲的很清楚。
## 为什么要加key
可以回头看下上面的源码，有一个`sameVnode`函数，其源码可以简化为如下：
```js
function sameVnode (a, b) {
  return (
    a.key === b.key && a.tag === b.tag
  )
}
```
也就是说，判断两个节点是否为同一节点（也就是是否可复用），标准是key相同且tag相同。
以下图的改变（圆圈代表一个vnode，所有node的tag相同）为例
![](http://ww1.sinaimg.cn/large/006tNc79gy1g5tfcjl92aj30xm0bqabk.jpg)

* 当不加key时，key都是undefined，默认相同，此时就会按照上一节diff算法的就地复用来进行比较：
![](http://ww2.sinaimg.cn/large/006tNc79gy1g5tfcuol55j310u0biabr.jpg)
以上，A复用B，B复用C，C复用D，D复用E，删除E；然后更新数据
> 说明：复用是指dom结构复用，如果数据有更新，之后会再进行数据更新

* 如果加上唯一识别的key
![](http://ww4.sinaimg.cn/large/006tNc79gy1g5tfd42ak4j310m0eajtd.jpg)
以上，B、C、D、E全部可以复用，删除A即可

从以上的对比可以看出，加上key可以最大化的利用节点，减少性能消耗

## 为什么不建议用index作为key
在工作中，发现很多人直接用index作为key，好像几乎没遇到过什么问题。确实，index作为key，在表现上确实几乎没有问题，但它主要有两点不足：
* 1、index作为key，其实就等于不加key
* 2、index作为key，只适用于不依赖子组件状态或临时 DOM 状态 (例如：表单输入值) 的列表渲染输出（这是vue官网的说明）
### 第一点
对于第一点，还是以上面的例子来说明

虽然加上了key，但key是就是当前的顺序索引值，此时sameNode(A,B)依然是为true，所以与不加key时一样，A复用B的结构并将数据更新为B。下面以一个demo来说明
```html
<div id="demo">
  <div v-for="(item,index) in list" :key="index">
    <item-box :data=item></item-box>
    <button @click="delClick(index)">删除</button>
  </div>
</div>
```
```js
Vue.component('item-box',{
    template:'<span>{{data.msg}}</span>',
    props: ['data'],
})
  var demo = new Vue({
    el: '#demo',
    data() {
      return {
        list: [
          {
            msg: 'k1',
            id: 1
          },
          {
            msg: 'k2',
            id: 2
          },
          {
            msg: 'k3',
            id:3
          }
        ]
      }
    },
    methods: {
      delClick (index) {
        this.list.splice(index, 1)
      }
    }
  })
```
**操作**：删除k1
* 不加key，或用index作为key，变化过程是

图a![](http://ww3.sinaimg.cn/large/006tNc79gy1g5tfsjnyh3j302r02kt8j.jpg)

图b![](http://ww2.sinaimg.cn/large/006tNc79gy1g5tfsskug3j303b023gli.jpg)

图c![](http://ww4.sinaimg.cn/large/006tNc79gy1g5tfszj4s2j302z01qa9y.jpg)

图d![](http://ww3.sinaimg.cn/large/006tNc79gy1g5tft43cc8j303r029dfn.jpg)

也就是

![](http://ww1.sinaimg.cn/large/006tNc79gy1g5tfjbc658j30hg0e6wff.jpg)

经过对比，`复用1、复用2、删除3`(图b)，`更新1的数据`（图c），`更新2的数据`（图d）

* 将demo中的key值由`index`改为`item.id`，则变化过程是

![](http://ww1.sinaimg.cn/large/006tNc79gy1g5tfizxulzj303r029746.jpg)

也就是

![](http://ww3.sinaimg.cn/large/006tNc79gy1g5tfjrzl79j30i80d2aay.jpg)

经对比，复用2，复用3，删除1。

**小结**：从以上对比可知，用index做key，与不用key是一样的。由于把源码贴出来比较不易懂，所以只是把debugger源码的结果贴出来了，感兴趣的可以自己去debugger这个过程，理解的会更好。

### 第二点
第二点有两种情况，我们首先看依赖子组件状态的情况

### 依赖子组件状态

还是刚刚的例子，做一点修改
```js
Vue.component('item-box',{
    template:'<button @click="itemClick">{{status}}</button>',
    props: ['data'],
    data () {
      return {
        status: 'no'
      }
    },
    methods: {
      itemClick () {
        this.status = 'yes'
      }
    }
  })
```
也就是将template里面的数据由props改为data，即子组件内部的数据。

**操作**：点击第一个no和第二个no，然后点击第一个删除，奇怪的事出现了

* 不加key，或用index作为key，结果是

![](http://ww3.sinaimg.cn/large/006tNc79gy1g5tfk0ue56j303101s3ye.jpg)

本来应该删除第一个的，好像把第三个给删了。是这样么？是的。这个过程相当于第一点里面的图b，但却少了后续数据更新的过程了。为什么不更新数据了呢？因为，数据更新这个步骤是当依赖list的数据发生变化，再根据订阅模式中添加的依赖来依次更新数据（此处可以了解下双向绑定）。可以粗暴的理解为，不依赖于list的数据，此处不关心，不会去更新，流程就停留在图b了，因此我们看到的就是错误的表现了。

* 将demo中的key值由`index`改为`item.id`

![](http://ww2.sinaimg.cn/large/006tNc79gy1g5tfk7x4efj303y01ujra.jpg)

此时就是预期的结果啦

小结：以上就是官网里提到的，就地复用的原则不适用于依赖子组件状态的场景，以上例子中，status就是子组件的状态，与外部无关

#### 依赖临时dom状态

修改刚刚的demo
```html
<div id="demo">
  <div v-for="(item,index) in list" :key="index">
     <input type="text">
    <button @click="delClick(index)">删除</button>
  </div>
</div>
```
**操作**：在输入框中分别输入1、2、3，然后删除1。
* 不加key，或用index作为key，结果是

![](http://ww1.sinaimg.cn/large/006tNc79gy1g5tfkdmg36j306p01zwee.jpg)

不用多说了，一样的道理，因为这是input的临时状态，与list无关，所以停留在图b的状态就不会继续有数据更新了，我们看到的就是图b的样子了
* 将demo中的key值由`index`改为`item.id`

更不用多说了，这里就是对的了

![](http://ww4.sinaimg.cn/large/006tNc79gy1g5tfkj25daj3066025q2u.jpg)

## 总结
* diff算法默认使用“就地更新”的策略，是一个收尾交叉对比的过程。
* 用index作为key和不加key是一样的，都采用“就地更新”的策略
* “就地更新”的策略，只适用于不依赖子组件状态或临时 DOM 状态 (例如：表单输入值) 的列表渲染输出。
* 将与元素唯一对应的值作为key，可以最大化利用dom节点，提升性能

## 参考
* [Vue2.0 v-for 中 :key 到底有什么用？](https://www.zhihu.com/question/61064119/answer/183717717)
* [为什么使用v-for时必须添加唯一的key?](https://www.jianshu.com/p/342e2d587e69)
* [codepen](https://codepen.io/vvpvvp/pen/oZKpgE)
* [VueDiff算法的简单分析和一些个人思考](https://www.jianshu.com/p/cd39cf4bb61d)
















