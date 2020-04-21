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
报文的实体通过分块传输，最后一个分块长度值为0表示分块传输完毕。（即不需要服务器提前计算资源大小，并通过content-length告知）。
> 更多可参考[HTTP 协议中的 Transfer-Encoding](https://imququ.com/post/transfer-encoding-header-in-http.html)
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
[HTTP headers 之 host, referer, origin](https://juejin.im/post/5d8dd391f265da5b991d4b39)

### User-Agent

User-Agent用于指明浏览器的种类，一般格式如下：
```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36
```
### Accept

Accept指明能接受的文件类型，格式为`type/subtype`形式
```
text/html, text/plain
image/jpeg, image/gif, image/png
application/octet-stream, application/zip
```
还可使用q=来指明媒体类型的优先级，用分号(;)进行分隔。权重值q的范围是0-1(可精确到小数点后3 位)，且1为最大值。不指定权重q值时，默认权重为q=1.0
> 同类型的请求头还有：
> * Accept-Charset:指明能接受的字符集
> * Accept-Encoding:指明能接受的内容编码(压缩方式)
> * Accept-Language:指明能接受的的语言集
> 以上三种首部，都和Accept一样，可通过q=来设置优先级。

### If-Modified-Since

If-Modified-Since告知服务器，若If-Modified-Since字段值早于资源的最后更新时间（Last-Modified），则处理该请求，否则返回304（Not Modified）响应。
### If-None-Match

If-None-Match指明资源的Etag，若服务器上的资源的Etag与此不一致，则表明资源已发生变化，告知服务器处理该请求，否则返回304（Not Modified）响应。
### Cookie

Cookie为之前从服务端收到的Cookie，用于HTTP的状态管理。


 
## 常用的响应头
### Server
Server提供服务器的一些相关信息
```
Server: Apache/2.2.17 (Unix)
Server: nginx/1.10.2
```
### Set-Cookie
设置和页面关联的cookie，服务器通过这个头部把cookie传给客户端
Set-Cookie的字段值
```
属性 　　　　　　　　　　说明
NAME=VALUE 　　　　　　 赋予Cookie的名称和其值(必需项)
expires=DATE    　　　 Cookie的有效期(若不明确指定则默认为浏览器 关闭前为止)
path=PATH 　　　　　　  将服务器上的文件目录作为Cookie的适用对象(若不指定则默认为文档所在的文件目录)
domain=域名 　　　　　　作为Cookie适用对象的域名(若不指定则默认为 创建Cookie的服务器的域名)
Secure 　　　　　　　　 仅在HTTPS安全通信时才会发送Cookie
HttpOnly 　　　　　　　加以限制，使Cookie不能被JavaScript脚本访问
```
多个字段间以;分隔，如`Set-Cookie: name=value; HttpOnly`


## 常用的实体首部
### Location
Location字段一般配合3**响应码使用，提供重定向的URI。
### Content系列
* Content-Encoding：指明服务器对实体内容采用的编码方式。主要采用以下4种内容编码的方式：gzip、compress、deflate、identity
> 注意区分Content-Encoding和Transfer-Encoding，Content-Encoding是指**资源**的编码方式（压缩方式），Transfer-Encoding是指**报文**的编码方式。
* Content-Language：指明实体内容使用的自然语言

* Content-Length：指明实体内容的大小
> 对实体主体进行内容编码传输时，不能再使用Content-Length首部字段
> 通常如果 Content-Length 比实际长度短，会造成内容被截断；如果比实体内容长，会造成 pending。
* Content-Type：指明实体内容的媒体类型，和首部字段Accept一样，字段值用type/subtype形式赋值。

### Last-Modified
Last-Modified指明资源最终修改时间。客户端下次访问时，会在If-Modified-Since字段中带上该字段的值。

### Etag
Etag指明资源的实体标识。客户端下次访问时，会在If-None-Match字段中带上该实体标识。

