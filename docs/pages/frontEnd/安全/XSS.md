本文主要是对极客时间中[《浏览器工作原理与实践》](https://time.geekbang.org/column/article/152807)的安全相关部分的学习笔记。部分图采用文章[「前端食堂」再来一打Web安全面试题🔥(持续更新)](https://juejin.im/post/5e78d298f265da576a57a6bc#heading-6)中的图片。

## 安全与自由的平衡
Web一直在安全和自由之间寻找平衡点。为了Web世界的自由，默认页面能引入第三方资源，但为了安全又通过CSP策略加以限制；为了安全，默认XMLHttpRequest 和 Fetch 不能跨站请求资源，然后又通过 CORS 策略来支持其跨域。

为了更多的自由，支持默认页面能引入第三方资源和CORS，同时也就带来了很多安全问题，XSS就是其中一个。

## 什么是XSS
XSS（Cross Site Scripting），跨站脚本攻击，为了与CSS区分，故简称为XSS。

名称里的关键字是Scripting脚本，表明XSS的攻击方式是通过脚本：黑客往HTML文件中注入恶意脚本，从而在用户浏览页面时利用恶意脚本对用户发起攻击。
> 最开始的时候，这种攻击是通过跨域来实现的，所以叫“跨域脚本”。但是发展到现在，往 HTML 文件中注入恶意代码的方式越来越多了，所以是否跨域注入脚本已经不是唯一的注入手段了，但是 XSS 这个名字却一直保留至今。

## XSS可以做些什么？
由于XSS是通过注入恶意脚本实现，因此基本上只要页面脚本可以做的事，XSS都可以做。
#### 窃取Cookie
恶意JavaScript可以通过`document.cookie`获取用户Cookie信息。

获取到Cookie后，可以通过Ajax请求将数据发送给恶意服务器（跨域可以通过CORS解决），恶意服务器拿到用户Cookie后，可以在其他电脑删模拟用户登录，进行转账等恶意操作。
#### 监听用户行为
恶意JavaScript可以通过`addEventListener`监听用户的键盘事件，比如输入的银行卡信息、密码、身份证号等，并将其发给恶意服务器。获得这些信息后，可以用来看很多其他坏事。
#### 修改DOM
恶意JavaScript可以修改用户浏览的页面，比如伪造登录窗口等，用来骗取用户的账号和密码。

#### 生成浮窗广告
恶意JavaScript可以在页面生成浮窗广告，严重影响用户体验。

## 恶意脚本如何注入
我们知道了XSS通过恶意脚本可以做很多坏事，那这些恶意脚本是如何注入的呢？

通常情况下，主要有以下3种方式注入方式：
* 存储型XSS攻击
* 反射型XSS攻击
* 基本DOM的XSS攻击
### 存储型XSS
存储型XSS也称为持久性XSS，黑客将恶意JavaScript脚本长期存在页面服务器，一旦用户访问页面相关数据，恶意JavaScript就会执行。

大致过程如下：
* 1、黑客利用网站漏洞，将一段恶意JavaScript提交给服务器并保存到数据库
* 2、用户访问了该包含恶意JavaScript的页面
* 3、用户访问页面时，恶意JavaScript将会执行，从而实现以上列举的各类XSS攻击（窃取Cookie等）。
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd58htkftcj30zk0mhjts.jpg)
### 反射型XSS
与存储型XSS不同，反射型XSS不需要将恶意JavaScript存储，然后用户再访问带有恶意JavaScript的页面，而是通过诱导用户点击一个包含恶意 JavaScript的链接URL，实现反射型XSS攻击。
大致过程如下：
* 1、黑客构造带有恶意脚本的链接URL
* 2、黑客诱导用户点击，页面服务器将恶意脚本取出，拼接在HTML中返回给用户
* 3、用户接收到响应后，解析页面执行，此时恶意 JavaScript被执行，实现了XSS攻击。
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd58i2nb7pj30yu0oygob.jpg)
### 基本DOM的XSS

## 如何防止XSS攻击
通过XSS攻击的实现方式，我们可以发现他们有一个共同点，必须向浏览器注入恶意脚本。另外大多数情况下，是窃取用户的信息发送到恶意服务器。

因此要防止XSS攻击，可以从2点入手：
* 1、防止恶意JavaScript的注入
* 2、防止恶意消息的发送

下面来看一些常用的防止XSS攻击的策略。
### 对输入脚本进行过滤或转码
提到对输入进行过滤，可能大家都会觉得应该由前端过滤，但其实攻击者完全可以绕过前端，直接构造请求，想服务器提交恶意代码。因此过滤/转码由服务端来做更安全，当然，前端同时也做最好，多一层防护。

```js
code:<script>alert('你被xss攻击了')</script>
```
上述代码过滤后如下
```js
code:
```
当用户再次请求页面时，恶意脚本已被过滤，不会发生XSS攻击。

上述代码转码后如下
```
code:&lt;script&gt;alert(&#39;你被xss攻击了&#39;)&lt;/script&gt;
```
经过转码，`<script>`标签已经被转为`&lt;script&gt;`，页面不会将其识别为可执行脚本，因此恶意脚本不会被执行，不会发生XSS攻击。

> 对输入脚本进行过滤和转码可以解决特定的XSS问题，但有时候也会带来乱码问题。比如用户正常输入了5 < 7，但却被转码为5 &lt; 7，出现乱码问题。
### 充分利用CSP
参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)，
大部分XSS攻击最终都要将窃取的信息发送给恶意服务器，或者需要加载外部恶意脚本，CSP(Content Security Policy)就是主要通过限制有效域来限制对恶意脚本的访问或者向恶意服务器发送请求。

CSP通过添加一个`Content-Security-Policy`头部到一个页面，以控制浏览器可以访问哪些源。另外也可以通过<meta>元素配置：
```
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src https://*; child-src 'none';">
```

通过CSP，我们可以实现以下几个功能：
* 限制加载其他域下的资源文件，这样即使黑客插入了一个 JavaScript 文件，这个 JavaScript 文件也是无法被加载的；
比如，限制页面的所有内容必须来自于同一个源
```
Content-Security-Policy: default-src 'self'
```

* 禁止向第三方域提交数据，这样用户数据也不会外泄；
比如仅允许向`https://api.example.com`发起连接
```
Content-Security-Policy: default-src 'self'; connect-src https://api.example.com
```

* 禁止执行内联脚本和未授权的脚本；
比如仅允许脚本来自于`userscripts.example.com`
```
Content-Security-Policy: default-src 'self'; script-src userscripts.example.com
```

### 使用HttpOnly属性
很多XSS攻击都是窃取Cookie的，因此可以通过HttpOnly来保护Cookie的安全。

服务端在响应中通过`set-cookie`设置Cookie时，为某些Cookie设置为HttpOnly。

顾名思义，被设置了HttpOnly后，该Cookie就只能使用在HTTP请求中，无法通过脚本也就是`documnet.cookie`获取到。

在浏览器控制台可以看到，被设置了HttpOnly的Cookie的HttpOnly属性是勾上了的
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd5b73cjulj30ic06r0tw.jpg)

## 参考

* [《浏览器工作原理与实践》](https://time.geekbang.org/column/article/152807)
* [前端安全系列（一）：如何防止XSS攻击？](https://tech.meituan.com/2018/09/27/fe-security.html)