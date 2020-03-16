## 分类
* 通用首部（General headers）：提供报文最基本的信息，既可以出现在请求报文中，也可以出现在响应报文中。
* 请求首部（Request headers）：提供更多有关请求的信息。
* 响应首部（Response headers）：提供更多有关响应的信息。
* 实体首部（Entity headers）：描述主体的长度和内容，或者资源自身。
* 扩展首部（Extension headers）：规范中没有定义的新首部。

## 常用的通用首部
### Connection
Connection用于连接管理，常见的2个属性值为keep-alive和close。

* close：HTTP1.1为默认持久连接，当服务端想要断开连接时，则指定Connection为close

* keep-alive：HTTP1.0版本的默认连接都是非持久连接。因此，如果想在旧版本的HTTP协议上维持持久连接，需要将connection指定为keep-alive(由于历史原因，很多浏览器还是会在1.1版本中传发送Connection:keep-alive)
### Date
Date用于指明报文创建的日期和时间。
### Transfer-Encoding
Transfer-Encoding用于指明报文采用的编码方式。

最新的HTTP版本中，此属性只有一个值：chunked（分块编码）。在头部加入 Transfer-Encoding: chunked 之后，就代表这个报文采用了分块编码。
报文的实体通过分块传输，最后一个分块长度值为0表示分块传输完毕。
> [HTTP 协议中的 Transfer-Encoding](https://imququ.com/post/transfer-encoding-header-in-http.html)
### Cache-control
Cache-control用于控制缓存的相关机制。
参考：[前端学HTTP之报文首部](https://www.cnblogs.com/xiaohuochai/p/6159326.html#anchor3)和[http缓存](./http缓存.md)



## 常用的请求头
### Host
Host指明了请求服务器的**域名/IP地址和端口号**，即指明目的地。HTTP1.1中规定必须传Host字段。
用途：一个IP上可能运行着多个虚拟主机（多个虚拟服务器），因此使用Host来区分客户端具体要访问的服务器域名。
>请求被发送至服务器时，请求中的主机名会用IP地址直接替换，因此无法区分具体的服务器域名
### Referer
Referer指明了当前请求页面的**来源页面**的地址（**完整地址，协议+域名+端口号+路径+参数（注意，不包含 hash值）**）

用途：
* 服务端通过该字段进行统计分析、日志记录以及缓存优化等
* 防止图片盗用，对图片服务器加一个判断，如果referer不是来源于自己的服务器，则将其拦截
* 某种程度上可以防止站外的crsf攻击（但referer也可以被伪造）

在以下几种情况下，Referer 不会被发送：

* 来源页面采用的协议为表示本地文件的 "file" 或者 "data" URI；
* 当前请求页面采用的是非安全协议，而来源页面采用的是安全协议（HTTPS）；
* 直接输入网址或通过浏览器书签访问；
* 使用 JavaScript 的 Location.href 或者是 Location.replace()；
* 使用 html5 中 noreferrer

### Origin
Origin指明了请求来自于哪个站点，即**协议+域名+端口号**。
用途：主要用于CORS请求。
https://juejin.im/post/5d8dd391f265da5b991d4b39
* User-Agent
ser-Agent用于指明浏览器的种类，一般格式如下：
```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36
```
* Accept
Accept指明能接受的文件类型
Accept-Charset、Accept-Encoding、Accept-Language
* Expires
* If-Modified-Since
* If-None-Match
* Range
* Cookie


 
## 常用的响应头
* Server：服务器的一些相关信息
* Access-Control-Allow-Headers: 服务器端允许的请求Headers
* Access-Control-Allow-Methods: 服务器端允许的请求方法
* Access-Control-Allow-Origin: 服务器端允许的请求Origin头部（譬如为*）


Set-Cookie：设置和页面关联的cookie，服务器通过这个头部把cookie传给客户端
Keep-Alive：如果客户端有keep-alive，服务端也会有响应（如timeout=38）


## 常用的实体首部
* Location
* Content系列
Content-Encoding、Content-Language、Content-Range、Content-Length、Content-Type等

通常如果 Content-Length 比实际长度短，会造成内容被截断；如果比实体内容长，会造成 pending。
* 缓存系列
Last-Modified：请求资源的最后修改时间
Expires：应该在什么时候认为文档已经过期,从而不再缓存它
Etag

