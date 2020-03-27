## 标记语言
XML、HTML、XHTML这三者都有ML。ML(Markup Language)标记语言在维基百科中的解释是：

一种将**文本**以及**文本相关的信息**结合起来，展示出关于文档结构和数据处理细节的计算机文字编码。与文本相关的其他信息（包括文本的结构和表示信息等）与原本的文本结合在一起，但是使用标记（markup）进行标识。

用html举个例子：
```html
<h1>我爱我家</h1>
```
上面的例子中的”我爱我家”就是文本，与文本相关的其他信息”这段文本是个标题“就用标记h1进行标识。

## HTML
HTML(Hyper Text Markup Language)，即超文本标记语言。
* HTML的标签是固定的，只能用已经规定好的标签来对文本进行特定的描述
* HTML被设计用来显示数据。

## XML
XML(Extensible Markup Language)，即可扩展标记语言。**可扩展**体现在XML的标签不是固定的，需要自己定义。
比如描述一张桌子的相关信息：
```html
<table>
    <name>African Coffee Table</name>
    <width>80</width>
    <length>120</length>
</table>
```

我们可以根据自己的需要，定义自己的标签。

**命名空间**

为了防止大家定义的标签名重复（比如在A的命名里，table表示桌子；而在B的命名里，table表示表格），XML采用命名空间来避免命名冲突。为了区分世界各地的命名，需要一个独一无二的标识来区分不同的文件的命名，而域名无疑是一个完美的选择。

为标签添加一个xmlns属性
```html
<table xmlns="http://www.baidu.com">
    <name>African Coffee Table</name>
    <width>80</width>
    <length>120</length>
</table>
```
这样不同域名下的命名就不会冲突了。

**XML与HTML的区别**

XML和HTML都是标记语言，但两者可以说完全不一样
* HTML的标签固定的，XML的标签是自定义的
* XML旨在传输和存储数据；HTML旨在显示数据

**XML与json**

XML与json的设计初衷都是，实现一种通用且可读性高的数据格式。这两个目的XML和json都做到了，但是XML更像是先行者，在微软的推动下，开启了通用格式思想的大门，但相比json，还是有一些不足：

* XML标签冗余高，数据体积大，传输速度慢
* XML解析较难，json解析难度几乎为0

## XHTML
XHTML(Extensible Hyper Text Markup Language)， 可扩展超文本标记语言， 是以 XML 格式编写的 HTML，是更严格更纯净的HTML版本。

早起的HTML的编写是十分散漫的，很多写法都不规范。于是便引入XHTML将HTML规划范。与HTML的区别：

**文档结构**
* XHTML中`DOCTYPE` 是强制性的
* 标签`<html>` 中的命名空间属性xmlns是强制性的
`<html>`、`<head>`、`<title>` 以及 `<body>` 也是强制性的

**元素语法**
* XHTML 元素必须正确嵌套
* XHTML 元素必须始终关闭
* XHTML 元素必须小写
* XHTML 文档必须有一个根元素

**属性语法**
* XHTML 属性必须使用小写
* XHTML 属性值必须用引号包围
* XHTML 属性最小化也是禁止的

也就是，一个带有最少标签的XHTML文档如下：
```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

    <head>
        <title>Title of document</title>
    </head>
    <body>
        ......
    </body>

</html>
```
## HTML5
由于一些历史原因（可参考[这篇文章](https://waxdoll.gitbooks.io/webdesignfoundations/content/appendix/differences_xhtml45.html)），XHTML没有很好的做到向后兼容，W3C制定了下一代HTML标准，也就是HTML5。

HTML5 引入了很多新特性，不多对于一个新标准出现而言，它最重要的一个特性是会兼容以前的网页，旧的不按HTML5标准的网页并不会受影响，都能正常使用。向后兼容这一点对于一个新标准是否能成功，比起新特性多么诱人显得更为重点。

开发者可以将将已有网页的第一行改为`<!DOCTYPE html>`，它就成了一个HTML5网页，并且照样可以在浏览器正常显示。