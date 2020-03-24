网上最普遍的实现三角形的方法，就是通过控制border来实现，那为什么可以呢？

## 原理
我们先来看看border的表现形式。

```css
#box{
  width:100px;
  height:100px;
  background:yellow;
  border-top: 20px solid red;
  border-right:20px solid black;
  border-bottom:20px solid green;
  border-left:20px solid blue;
}
```
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd4qor65pfj305f0553yi.jpg)

观察上图可以发现，border表现为梯形。当减小box的宽高时，会发生如下变化：

![](https://tva1.sinaimg.cn/large/00831rSTgy1gd4qp0ppxoj301v01tdfq.jpg)

从上图很容易看出，当box宽度降低到很小，也就是border的梯形的上边降到很小。所以想一想，当这一值降到0时，border就变成了三角形。如下图：

![](https://tva1.sinaimg.cn/large/00831rSTgy1gd4qp6rujmj301s01m3ye.jpg)

所以我们就可以通过将元素宽高设置为0，而通过控制border来得到想要的三角形了。

## 实现
将不需要方向的border设置为透明（transparent），就可以用来实现三角形了。比如想实现下三角形，就将`border-left`，`border-bottom`，`border-right`设置为transparent即可。

```css
#box{
  width:0px;
  height:0px;
  border-top: 20px solid red;
  border-right:20px solid transparent;
  border-bottom:20px solid transparent;
  border-left:20px solid transparent;
}
```
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd4qpzrdwdj301w00ydfp.jpg)

```css
#box{
  width:0px;
  height:0px;
  border-top: 20px solid red;
  border-right:20px solid transparent;
  border-bottom:20px solid transparent;
  border-left:20px solid red;
}
```
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd4qr0m4w4j301s01jmx1.jpg)

```css
#box{
  width:0px;
  height:0px;
  border-top: 60px solid red;
  border-right:20px solid transparent;
  border-bottom:0px solid transparent;
  border-left:20px solid transparent;
}
```
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd4qrb9l5vj301y0280sm.jpg)

```css
#box{
  width:100px;
  height:100px;
  border-top: 60px solid red;
  border-right:20px solid transparent;
  border-bottom:0px solid transparent;
  border-left:20px solid transparent;
}
```
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd4qro4a8gj305502h747.jpg)

 

就不一一列举了，只要明白每个方向的border都是一个三角形，就能通过调整border的大小和颜色/透明，获得各种三角形和梯形了。