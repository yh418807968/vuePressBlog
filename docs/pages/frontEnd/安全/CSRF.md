## 什么是CSRF
CSRF(Cross Site Request Forgery)，跨站请求伪造。名字非常好的概括了CSRF的攻击方式：黑客利用用户的登录状态（伪造），并通过第三方站点（跨站）做一些坏事（通过发起请求来实现）。

同时，我们也可以提炼出要实现CSRF需要满足的三要素：
* 1、用户要登录目标站点，并保持登录状态
* 2、需要打开一个第三方网站
* 3、目标站点服务器要存在漏洞（允许第三方站点访问）

## 如何发起CSRF攻击
根据以上分析的CSRF的三要素，大概有几种攻击方式。

### 自动发起GET请求
用户访问了黑客的网站页面，页面上的图片标签的地址为目标站点，直接发起get请求
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>黑客的站点：CSRF攻击演示</h1>
    <img src="https://time.geekbang.org/sendcoin?user=hacker&number=100">
  </body>
</html>
```
黑客将转账接口隐藏在img标签内，欺骗浏览器这是一张图片。当该页面被加载时，浏览器会自动发起 img 的资源请求，如果服务器没有对该请求做判断的话，那么服务器就会认为该请求是一个转账请求，于是用户账户上的 100 极客币就被转移到黑客的账户上去了。
### 自动发起POST请求
用户访问了黑客的网站页面，页面上带有表格，表格的提交地址为目标站点，通过立即执行的script代码发起post请求，自动提交表单。
```html
<!DOCTYPE html>
<html>
<body>
  <h1>黑客的站点：CSRF攻击演示</h1>
  <form id='hacker-form' action="https://time.geekbang.org/sendcoin" method=POST>
    <input type="hidden" name="user" value="hacker" />
    <input type="hidden" name="number" value="100" />
  </form>
  <script> document.getElementById('hacker-form').submit(); </script>
</body>
</html>
```
黑客在页面中构建了一个隐藏的表单，表单的接口是转账接口。用户打开页面，script标签里的内容会自动执行，表单被自动提交，实现转账。
### 引诱用户点击
除了自动发起请求外，黑客还可以直接引诱用户点击黑客页面上的链接，这种方式通常出现在论坛上或者恶意邮件上。

```html
<div>
  <img width=150 src=http://images.xuejuzi.cn/1612/1_161230185104_1.jpg> </img> </div> <div>
  <a href="https://time.geekbang.org/sendcoin?user=hacker&number=100" taget="_blank">
    点击下载美女照片
  </a>
</div>
```
以上代码，黑客在页面上放了一张美女的图片，下面放了下载地址，但这个地址实际是转账接口，只要用户点击链接，那么就会执行转账操作。

## 如何防止CSRF攻击
想要知道如何防止CSRF攻击，我们再来看看CSRF的三要素：
* 1、用户要登录目标站点，并保持登录状态
* 2、需要打开一个第三方网站
* 3、目标站点服务器要存在漏洞（允许第三方站点访问）

如果从前两点入手，我们就需要去约束用户的行为，这不太可能。因此，要防止CSRF最关键的点，就是提升服务器的安全性，减少漏洞。

要让服务器避免遭受到 CSRF 攻击，通常有以下几种途径。
### 利用Cookie的SameSite
CSRF的第一要素是需要用户保持登录状态，而使得浏览器和服务器能维持登录状态的关键点就是Cookie。要防止CSRF攻击，就需要让黑客拿不到用户的登录态，也就是拿不到用户Cookie。
**Cookie的SameSite**可以解决这个问题的，SameSite属性可以让Cookie在**跨站**请求时不会被发送。

#### 跨站和跨域
> 此部分参考冴羽的[预测最近面试会考Cookie 的 SameSite 属性](https://juejin.im/post/5e718ecc6fb9a07cda098c2d#heading-14)
在了解SameSite之前，我们先来理解下什么是跨站，和跨域有什么区别。

我们所说的**”源(origin)“**，是包括协议、域名和端口；因此所谓”同源(same-origin)“，就是协议、域名和端口都需要相同，任一不同，就称为”跨域(cross-origin)“。
我们所说的**”站(site)“**，是指URL 的 eTLD+1，只要两个 URL 的 eTLD+1 相同，即为”同站/第一方站点“ ，否则为”跨站/第三方站点“。其中，eTLD 表示有效顶级域名，注册于 Mozilla 维护的公共后缀列表（Public Suffix List）中，例如，.com、.co.uk、.github.io 等。eTLD+1 则表示，有效顶级域名+二级域名，例如 taobao.com 等。也就是说，”站“是包括有效顶级域名+二级域名，不包括协议和端口。

同源策略作为浏览器的安全基石，因此判断是比较严格的（协议、域名和端口都相同）；而Cookie中的”同站“就比较宽松一点。
> 举几个例子，www.taobao.com 和 www.baidu.com 是跨站，www.a.taobao.com 和 www.b.taobao.com 是同站，a.github.io 和 b.github.io 是跨站(注意是跨站)。
#### SameSite属性
SameSite属性有3个值：
* Strict 最为严格，仅允许同站请求携带Cookie，禁止第三方站点的Cookie。
* Lax 相对宽松，允许部分第三方请求携带 Cookie。
* None 没有限制，在任何情况下都会发送Cookie数据。


因此，我们想要的是：
* 如果是同一个站点发起的请求，那么就需要保证 Cookie 数据正常发送
* 如果是从第三方站点发起的请求，需要禁止发送某些关键数据到服务器。
> 与当前页面地址栏的url不属于同一站点的地址，就被称为是第三方站点

**Cookie的SameSite**正是为了解决这个问题的。我们先来简单了解下SameSite.

登录状态主要是通过Cookie识别，通过SameSite禁止第三方站点携带Cookie（也就是对目标站点的Cookie设置限制，在黑客网站上发起请求时，此Cookie不会被带上）
### 通过Refefer和Origin验证请求源
针对要素的第三点，可以通过服务器验证请求源来避免，不允许第三方站点访问之类的
### CSRF Token
浏览器发起请求时，服务器会返回一个Token，然后将该Token植入到返回的页面中（比如隐藏的input）, 浏览器如果要发起请求，，必须要带上这个Token，服务器会验证是否合法。
从第三方站点发起的请求，就没法拿到这个Token，所以即使发出了请求，服务器也会因为 CSRF Token 不正确而拒绝请求。