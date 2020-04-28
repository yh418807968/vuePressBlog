针对题目：https://www.cnblogs.com/youhong/p/7481828.html

其实此问题主要的方向，就是我们需要给#right一个宽度，使得省略号能生效，但是宽度又不能是固定宽度。也就是我们要实现一个自定义宽度大小，但这个大小也受一定限制（**不能为内容宽度**）
### 方案一：overflow:hidden
抛开此题，overflow:hidden就相当于限制了当前元素的宽度不能为内容宽度，得根据父元素的宽度来，也就是说实际上就是给元素加上了宽度


### 方案二：calc
不用flex，直接两个都display：inline-block；然后右边calc(100% - 100px)

### 方案二：width:0
加上一个较小的宽度，此时实际上是flex-basis为auto，所以使用了width的值，而此时自身尺寸就是width的值。然后flex-grow根据剩下的宽度大小，扩大宽度

#### 有关flex-basis
flex-basis:auto时选取【自身尺寸】的优先级
```
min-width > || max-width > width > Content Size
```

【为什么用flex-basis：0不行呢？】
当元素的内容宽度小于flex-basis时，会按flex-basis展示，但是当内容宽度大于flex-basis时就会为内容宽度的大小。也就是max(content, flex-basis)的值，此时最大宽度很大了，因此就溢出了。

![](https://tva1.sinaimg.cn/large/007S8ZIlgy1ge77bssge4j30nv0b3jty.jpg)

### 参考
https://www.zhangxinxu.com/wordpress/2019/12/css-flex-basis/
https://juejin.im/post/5d538d3ce51d4561f95eea1d#heading-2