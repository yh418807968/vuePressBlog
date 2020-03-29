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

我们所说的**源(origin)**，是包括协议、域名和端口；因此所谓”同源(same-origin)“，就是协议、域名和端口都需要相同，任一不同，就称为”跨域(cross-origin)“。

我们所说的**站(site)**，是指URL 的 eTLD+1，只要两个 URL 的 eTLD+1 相同，即为”同站/第一方站点“ ，否则为”跨站/第三方站点“。其中，eTLD 表示有效顶级域名，注册于 Mozilla 维护的公共后缀列表（Public Suffix List）中，例如，.com、.co.uk、.github.io 等。eTLD+1 则表示，有效顶级域名+二级域名，例如 taobao.com 等。也就是说，**”站“是包括有效顶级域名+二级域名，不包括协议和端口**。

同源策略作为浏览器的安全基石，因此判断是比较严格的（协议、域名和端口都相同）；而Cookie中的”同站“就比较宽松一点。
> 举几个例子，www.taobao.com 和 www.baidu.com 是跨站，www.a.taobao.com 和 www.b.taobao.com 是同站，a.github.io 和 b.github.io 是跨站(注意是跨站)。
#### SameSite属性
SameSite属性有3个值：
* Strict 最为严格，仅允许同站请求携带Cookie，禁止第三方站点的Cookie。
* Lax 相对宽松，允许部分第三方请求携带 Cookie。
* None 没有限制，在任何情况下都会发送Cookie数据。

各属性在各场景下的发送Cookie情况：
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd68tbd4jpj30we0iigob.jpg)

根据具体需求场景，可以将Cookie的值设为Strict或者Lax，这样在跨站请求时，Cookie就不会发送到第三方站点服务器，也就无法实现CSRF攻击。
> 最近2月份（2020年2月份），Chrome80版本中默认屏蔽了第三方的Cookie，也就是SameSite的值时默认none，Chrome80版本中改为默认为Lax了。
>
> 这一修改导致阿里系的很多应用产生了问题，阿里已经全面修复，相信还有其他很多产品也都收到了影响。具体可参见[预测最近面试会考 Cookie 的 SameSite 属性](https://juejin.im/post/5e718ecc6fb9a07cda098c2d#heading-14)和[Chrome 80.0中将SameSite的默认值设为Lax,对现有的Cookie使用有什么影响?](https://www.zhihu.com/question/373011996/answer/1032783062)

### 通过Refefer和Origin验证请求源
针对要素的第三点，可以通过服务器验证请求源，由于CSRF大多数来自于第三方站点，因此可以禁止第三方站点的请求。我们通过HTTP的请求头Referer和Origin来判断是否来自第三方站点。

#### Referer
Referer表头指明请求的来源地址（完整地址），根据地址中的域名就可以判断来源站点了。

对于Ajax请求，图片和script等资源请求，Referer为发起请求的页面地址。对于页面跳转，Referer为打开页面历史记录的前一个页面地址。

根据[Referer Policy](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referrer-Policy)，开发者可以为Referer设置不同的值，从而控制是否要发送referer等条件。

服务器端验证请求头中的 Referer 并不是太可靠，在部分情况下，攻击者可以隐藏，甚至修改自己请求的Referer。
#### Origin
在一些跨站请求中，请求的header会带上Origin属性，Origin只包含域名信息，不包含具体的URL路径。这是 Origin 和 Referer 的一个主要区别。在这里需要补充一点，Origin 的值之所以不包含详细路径信息，是有些站点因为安全考虑，不想把源站点的详细路径暴露给服务器。

因此，服务器的策略是优先判断 Origin，如果请求头中没有包含 Origin 属性，再根据实际情况判断是否使用 Referer 值。
### CSRF Token
浏览器发起请求时，服务器生成一个Token存储在session中，然后将该Token植入到返回的页面中。之后每次发起请求都把Token带上，服务器收到后与session中的Token对比，如果不一致，则拒绝请求。

此方法的难点在于，如何将**token以参数的加入请求**？

根据上面提到的CSRF攻击方式，主要是通过a链接、静态资源标签（比如img）、表单这些形式来发起，因此需要对页面中的这类元素都加上token。通常，当页面每次加载时，服务端使用 javascript 遍历整个 dom 树，对于 dom 中所有的 a 和 form 标签后加入 token。这样可以解决大部分的请求，但是对于在页面加载之后动态生成的HTML代码，这种方法就没有作用，还需要开发者在编码时手动添加Token。

* 对于GET请求，token附在请求地址后
```html
<a href="http://url?csrftoken=tokenvalue"></a>
```
* 对于POST表单请求，可以在form中加上一个隐藏的input，其value为token值
```html
<!DOCTYPE html>
<html>
<body>
    <form action="https://time.geekbang.org/sendcoin" method="POST">
      <input type="hidden" name="csrf-token" value="nc98P987bcpncYhoadjoiydc9ajDlcn">
      <input type="text" name="user">
      <input type="text" name="number">
      <input type="submit">
    </form>
</body>
</html>
```
这样页面在发起请求时，就会带上token，服务器会验证该 Token 是否合法。如果是从第三方站点发出的请求，那么将无法获取到 CSRF Token 的值，所以即使发出了请求，服务器也会因为 CSRF Token 不正确而拒绝请求。
