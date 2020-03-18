## 前言
AST，抽象语法树，在我们日常开发中似乎从来没涉及到，甚至可能根本没听说过。但是，它其实遍布了我们日常使用到的工具：vue/react，webpack，eslint，babel等，都是基于AST的。

我们做个比喻，把js源码比作一辆汽车，现在我们要整体改装/检修汽车，那么我们就需要用螺丝刀把汽车拆解成一堆零件，然后对其中需要改装/检修的零件进行改装/检修，最后再将零件重新组装起来，得到一台新的汽车。

上面例子中拆解得到的零件就是AST，而螺丝刀就是JS Parser（js语法解析器），常用的JS Parser有esprima、traceur、acorn、jsshift 等。以babel为例，原来的汽车就是源码（可能包含了es6语法），经过babel改装后的汽车就是语法为es5的代码。

通过上面的一系列操作（通过将源代码拆解为AST，然后对AST做一些改动，再拼装回去），我们可以做很多事：
* 代码语法的检查
* 代码风格的检查
* 代码的格式化
* 代码的高亮
* 代码错误提示
* 代码自动补全
等等。

## 拆解过程一：词法分析/分词
```
源代码 -> tokens
```
拿到源码，对于解析器来说，这就是一堆的字母、数字、空格等，这就像小时候我们拿到一篇课文，老师会先让我们把词一个个分隔开，比如'我爱我的祖国'，要划分成'我/爱/我的/祖国'，这样我们才能更好的理解文章的意思，我们这一步也就是做类似的工作：**分词**。

可通过[在线demo](https://resources.jointjs.com/demos/javascript-ast)看下

![](https://tva1.sinaimg.cn/large/00831rSTgy1gcxarqk39hj324c0ds41l.jpg)
图片左侧的代码经过分词得到图片右侧的结果，可以看到是一个个独立的token。整段代码的转换结果是一个数组，简化下就是这样的：
```js
[
    {
        "type": "Keyword",
        "value": "var"
    },
    {
        "type": "Identifier",
        "value": "a"
    },
    {
        "type": "Punctuator",
        "value": "="
    },
    {
        "type": "Numeric",
        "value": "42"
    }
    // .....
]
```
分词的大致过程就是，一个个字符解析，每增加一个字符就会跟js的关键字、操作符等做比较，如果满足条件就会被认为是一个token，然后继续开始对后续字符进行同样的操作；生成的token是具有语义的不可分割的最小单元。

## 拆解过程二：语法分析
```
tokens -> AST
```
经过分词，我们得到了一堆tokens，但是我们还不能知道这些tokens要表达什么意思。也就是我们已经拿到了词语：我、爱、我的、祖国，但是对于不同中文的人来说，他不知道每个单词的意思，也不知道语法，就依然不懂这句话表达什么意思。所以接下来我们要进行语法分析。
我们可以先通过[js解析器工具](https://astexplorer.net/)体验下，在左侧输入代码：
```
var a = 1
```
![](https://tva1.sinaimg.cn/large/00831rSTgy1gcxbql96ryj31kg0u0gwe.jpg)
会看到右侧会展示对应的AST，在右侧将鼠标放在对应节点上，左侧对应的代码会高亮。上面的工具栏还可以切换不同的解析器，一些解析器的解析结果还会有经过分词得到的tokens。

AST的节点有很多类型，我们可以展开树形结构看一看，想要更多了解具体可以参考文章[高级前端基础-JavaScript抽象语法树AST](https://juejin.im/post/5c8d3c48f265da2d8763bdaf#heading-11)

## 改装过程：转换
拆解得到AST后，前期准备工作就算完成了，下面要开始最核心的工作了：改装(转换)。我们就来简单实现一个例子：将变量a替换为变量b。

这里选择解析器babelv7，输入如下代码
```
// 将变量a替换为b
export default function (babel) {
  const { types: t } = babel;
  
  return {
    name: "ast-transform", // not required
    visitor: {
      VariableDeclarator(path, state) {
        if (path.node.id.name == 'a') {
          path.node.id = t.identifier('b')
        }
      }
    }
  };
}
```
![](https://tva1.sinaimg.cn/large/00831rSTgy1gcxcgzqgafj31m70u0grx.jpg)
则可以看到，`var a = 1`被转换为了`var b = 1`


## 重装过程：生成
转换得到了新的AST，最后一步就是重装了。不过上一节的工具里，已经把这一步一起完成了，实际上这是两个步骤，在babel中也是不同的模板来完成的

* @babel/parser： js 代码 ->  AST 抽象语法树；
* @babel/traverse：  对 AST 节点进行递归遍历；
* @babel/types： 对具体的 AST 节点进行进行修改；
* @babel/generator：  AST 抽象语法树 -> 新的 js 代码；

## 参考
* [高级前端基础-JavaScript抽象语法树AST](https://juejin.im/post/5c8d3c48f265da2d8763bdaf#heading-11)
* [AST抽象语法树——最基础的javascript重点知识，99%的人根本不了解](https://segmentfault.com/a/1190000016231512)
* [把手带你入门 AST 抽象语法树](https://juejin.im/post/5e0a245df265da33cf1aea91#heading-8)





