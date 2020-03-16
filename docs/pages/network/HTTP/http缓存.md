::: tip
待重新整理
:::

在一次http请求过程中，http缓存主要涉及到三个角色：浏览器、浏览器缓存和服务端。以下我们按照一次http请求的顺序，讨论下不同情况下缓存的表现。
## 浏览器-浏览器缓存（强制缓存）

### 1. 浏览器是否有缓存？

安装浏览器时，会生成一个存放缓存的文件夹。此文件夹中包含了各缓存资源和资源的相关信息（比如url、expire time等）。如果有此资源的缓存记录，则表示有缓存；没有则表示没有缓存。
查看缓存文件的方法如下：

```
mac下目录：/Users/XXX/Library/Caches/Google/Chrome/Default/Cache
windows下目录：C:\Users\{用户名}\AppData\Local\Google\Chrome\User Data\Default\Cache
```
打开文件夹，可以看到里面保存着许多文件，这些都是缓存的资源，但是都是经过编码的，且我们不知道文件类型，因此无法查看。windows下有个工具可以帮忙查看。

* [下载chrome cache view](http://www.nirsoft.net/utils/chrome_cache_view.html)，打开下载文件中的exe文件，即可看到

![](https://tva1.sinaimg.cn/large/00831rSTgy1gcw285iiswj318s0ihtnd.jpg)
里面清晰的包含了每条缓存的相关信息（这些信息保存在cache文件夹下的index文件中），包括url、file size、expire time、cache control等。选中一条记录，按F7可以直接查看当前缓存资源、按F4可以查看并保存当前缓存资源。

### 2. 浏览器缓存是否过期
如果请求的资源有缓存，则浏览器会判断缓存是否过期，主要通过以下两个字段：

* **expires**

expires是HTTP1.0标准下的字段。expires值为一个绝对时间，表示资源过期的时间。如果当前时间大于此值，则表示已过期，反之未过期。

* **cache-control**
cache-control是HTTP1.1标准下的字段。cache-control:max-age，max-age值为一个单位为毫秒的时间段，表示资源在***毫秒后过期

通过以上判断，如果缓存未过期，则直接采用缓存资源，并返回200（for cache）；若缓存已过期，则要重新像服务端请求最新的资源。

### expires和cache-control的关系

* 如果请求中同时存在两者expires和cache-control:max-age，则expires将被忽略
* expires为绝对时间，这一依赖于客户端与服务端的时间保持一致，若客户端时间出错，将会判断有误；max-age为相对时间，不会出现此问题

#### no-cache与no-store
no-cache与no-store在客户端和服务端上代表的意义不一样，要分开来说。

* 在服务端响应中：no-cache表示浏览器可以对资源进行缓存，但是每次使用资源时不能直接使用，必须重新请求（也就是采用下面讲到的协商缓存）；no-store不允许浏览器对资源进行缓存，也就是客户端根本不会存在此资源的缓存文件。从上面的记录中的cache-control也能看出来，只会出现no-cache，不会出现no-store，因为no-store的资源压根不会被缓存，也就不会出现在缓存记录中

* 在客户端请求中：no-cache表示此次请求不采用缓存文件（即使有缓存），需要要服务端请求，返回200。（ctrl+F5强制刷新时，就是将cache-control设置为no-cache）作用相当于服务端响应中的no-store

#### 客户端no-cache和max-age=0

no-cache表示必须重新像服务端请求资源，返回200；max-age=0表示在重新获取资源之前，先检验ETag/Last-Modified，返回304
#### public与private

Cache-Control: public可以被所有用户缓存，包括终端和CDN等中间代理服务器
Cache-Control: private只能被终端浏览器缓存，不允许中继缓存服务器进行缓存

![](https://tva1.sinaimg.cn/large/00831rSTgy1gcw2e5hxlmj30te100mz8.jpg)


## 浏览器-服务端（协商缓存）
当浏览器没有缓存时，浏览器将像服务端发起请求。此时服务端也不直接返回新资源，会先看看客户端的资源是否已经是最新资源。

* 在上一次请求的响应中，服务端的response headers中会包含last-modified和etag（可以在上面提到的缓存记录中看到），当客户端再次发起请求时，会在request headers中带上 if-modified-since（对应last-modified的值）和if-none-match(对应etag的值)
* if-modified-since：服务端对比发过来的if-modifind-since和服务端的last-modified，如果时间一致，表示至上次请求后，服务端上此资源未修改过，浏览器可以使用缓存中的数据。相应状态码304，
* if-none-match：服务端对比发过来的if-none-match和服务端的etag，如果相等，表示至上次请求后，服务端上此资源未修改过，浏览器可以使用缓存中的数据。相应状态码304


#### last-modified与etag的关系
* last-modified只能精确到秒，若文件修改的一秒内修改多次，last-modified无法判断
* 有些资源会周期性的更新，但内容不一定变（仅最后修改时间last-modified变化），此时我们认为此资源未被修改，而last-modified会发生变化，etag(一般此类周期性更新的资源，etag中不依赖最后修改时间)未发生变化
* 某些服务器不能精确的得到文件的最后修改时间
【eTag的计算】
参见：https://juejin.im/post/5c136bd16fb9a049d37efc47
根据不同的服务器不一样，eTag和last-modified哪个优先可是根据服务器的配置



