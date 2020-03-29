## Cookie的来源
HTTP是一种无状态协议。所谓**无状态**，就是指HTTP不保存任何与用户有关的信息，服务端无法分辨请求是来源哪个客户端，即使同一个客户端连续发2次请求给服务端，服务端也无法识别这是来自于同一个客户端。

HTTP为无状态，但“保持状态”这一需求却十分必要，比如你加了一个商品到购物车，如果无法保持状态，那么你刷新下页面刚刚添加的数据就都没了...

**通过因此cookie和session机制来维护状态信息。**

![](https://tva1.sinaimg.cn/large/00831rSTgy1gdam1j004oj31260e6gnm.jpg)
为解决HTTP无状态的问题，因此cookie和session机制来维护状态。
* 第一次请求，服务端没有改用户的信息，于是新建session，并通过响应头`Set-Cookie`将sessionId返回
* 客户端收到响应后，浏览器在本地设置并保存相应的Cookie
* 当该用户再次发起请求时，请求头中会带上此cookie，服务端通过此cookie在数据库匹配到相应的用户（匹配不到则新建一个）
* 匹配到相应的用户，则返回该用户的相应数据

## Cookie的属性
cookie的属性包括：name，domain、path、expires/max-age、HttpOnly、secure。除了name为必填项，其余均为可选项。通常我们这样设置cookie：
```js
"name=value; expires=Sat, 08 Sep 2018 02:26:00 GMT; domain=baidu.com; path=/; secure; HttpOnly"
```
在浏览器的控制台可以查看Cookie，如图，我们分别解释下每个属性。
![](https://tva1.sinaimg.cn/large/00831rSTgy1gdamcdrvwkj30ss07r40r.jpg)


### Name/Value
显而易见，Name和value是Cookie最基本的属性，Name是cookie的名字，Value为对应的值。
### Domain
Domain指定可以使用该cookie的域名。如果没有指定，则默认为当前文档访问地址的域名。

`a.baidu.com`和`b.baidu.com`能共享`baidu.com`下的cookie，但`a.baidu.com`和`b.baidu.com`下的cookie不能相互共享。

注意一点：不能跨域设置Cookie。比如在juejin.im域名页面下设置百度的域名是无效的。

在浏览器控制台执行以下代码Max-age
```js
// 生效
javascript:document.cookie='myname=yh-juejin;path=/;domain=.juejin.im';
// 不生效
javascript:document.cookie='myname=yh-baidu;path=/;domain=.baidu.com';
```
会发现，只有在juejin.im域名下的cookie被设置并保存了。

![](https://tva1.sinaimg.cn/large/00831rSTgy1gdamrz0awrj30ko08gjto.jpg)

### Path
Path指定URL的路径，只有在此路径下的请求才能发送相应的cookie，Path用来在Domain的基础上进一步细化Cookie的适用范围。

比如若cookie的Path为`Path=/a`，则`/a/a1`下的资源会带上该cookie，`/b`下的资源则不会带上此cookie。
### Expires
Expires用于设置Cookie的过期时间。
* 如果Expires属性缺省时，表示此cookie为会话型Cookie，值为Session。会话型Cookie的值保存在浏览器内存中，浏览器关闭此cookie就会失效。
* 如果Expires有值，则表示此cookie为持久型Cookie，值为一个具体时间。持久型Cookie保存在用户的硬盘中，直至cookie过期或者用户主动清除。
> 注意一点，此过期时间是客户端时间，与服务端无关。

### Max-age
Max-age用于设置Cookie距离失效的时间间隔，单位为秒。
* Max-age为正数时，表示cookie为持久性cookie，存在硬盘中，直至cookie过期或者用户主动清除
* Max-age为负数时，表示cookie为会话型cookie
* Max-age为0时，会立即删除此cookie（cookie机制没有设置删除cookie的方式，通过此方式可以删除cookie）

**Max-age与Expires**
* Max-age的值为距离失效时间的时间段，Expires的值为失效时间的时间点
> Expires使用的绝对时间，若服务端与客户端时间不统一，则会导致实际失效时间不准确；Max-age用时间段表示，其实就是用相对时间表示，可以避免这一点。
* 当同时存在Max-age和Expires时，Max-age优先

### Size
Size属性指明单个cookie的大小，但不需要设置，由浏览器根据整个cookie的大小计算得出。注意这个大小不仅仅是value的值，而是包括name、value及其他所有属性的大小的总和。

一个域名下的所有cookie的大小总和被限制为4KB，所有超过限制的cookie不会被发送至服务端。大多数浏览器对单个域名下cookie的个数限制为50个，也就是这50个cookie的总大小不能超过4KB。

### HttpOnly
HttpOnly属性可以防止客户端脚本通过`document.cookie`等方式访问、修改Cookie，有助于避免XSS攻击。
### Secure
Secure属性指明Cookie只能在HTTPS协议下传输。使用 HTTPS 安全协议，可以保护 Cookie 在浏览器和 Web 服务器间的传输过程中不被窃取和篡改。

### SameSite
SameSite属性指明Cookie是否可以在跨站请求中被发送。

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

## Cookie的设置、获取和删除

#### 设置Cookie
* 服务端通过响应头的Set-Cookie字段设置Cookie，
* 客户端通过`document.cookie`设置Cookie，比如`document.cookie = name=yh";`

#### 获取Cookie
* 服务端直接获取请求头的Cookie字段
* 客户端通过`document.cookie`获取

获取到之后，以";"为分隔符，划分cookie的各属性值
#### 删除Cookie
通过设置Cookie过期来删除Cookie，Max-Age属性的值设为0

## Cookie的作用
Cookie 主要用于以下三个方面：

* 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
* 个性化设置（如用户自定义设置、主题等）
* 浏览器行为跟踪（如跟踪分析用户行为等）
### Cookie的不足
* 每个域名下的cookie数量有限：不同浏览器的限制不一样，大多数浏览器限制为50个
* 存储量有限，只有4KB：单个域名下所有cookie的大小总和不能超过4KB
* 每次HTTP请求都会随请求发送，增加包的大小

