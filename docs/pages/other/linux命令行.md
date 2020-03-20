本文仅整理较常用的命令行，命令行类别及相关参数不一定全面，持续更新。
## 文件管理
### linux系统目录结构
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd06lix3mnj312s0ik75e.jpg)
一些主要目录：
* /bin 是Binary的缩写, 这个目录存放着最经常使用的命令
* /etc 这个目录用来存放所有的系统管理所需要的配置文件和子目录
* /usr 这是一个非常重要的目录，用户的很多应用程序和文件都放在这个目录下

更多详情请参考[Linux 系统目录结构](https://www.runoob.com/linux/linux-system-contents.html)

### 文件属性
采用命令`ls -l`查看目录下的文件
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd06tfb0goj30s00c63zy.jpg)
第一个字符代表文件类型：d是目录、-是文件、其他略

更多详情请参考：[Linux 文件基本属性](https://www.runoob.com/linux/linux-file-attr-permission.html)

### 文件与目录管理
* 绝对路径：由根目录 / 写起，例如： `/usr/share/doc` 这个目录
* 相对路径：不是由 / 写起，例如由 `/usr/share/doc` 要到 `/usr/share/man` 底下时，可以写成： `cd ../man`；要进到`/usr/share/doc/index`，则写成 `cd index`即可。

### 常用命令
#### man+命令
查看某个命令的文档

#### ls列出目录
语法：`ls [选项] 目录`

参数列表：
* -a ：全部的文件，包括隐藏文件
* -d ：仅列出目录本身，而不是列出目录内的文件数据
* -l ：长数据串列出，包含文件的属性与权限等等数据

#### cd变更目录
语法：`cd 目标目录`

例子：
* 使用绝对路径切换到 runoob 目录: `cd /root/runoob/`
* 使用相对路径切换到**下级** runoob 目录: `cd ./runoob/` 或 `cd runoob`
* 使用相对路径切换到**同级** runoob 目录 : `cd ../runoob/`
* 切换到目前的**上一级**目录: cd ..

#### pwd显示当前所在目录
**语法**：`pwd`


#### mkdir创建新目录
语法:` mkdir [选项] 目录`

参数列表：
* -m ：配置文件的权限
* -p ：帮助你直接将所需要的目录(包含上一级目录)递归创建起来！

#### cp拷贝文件或目录（待测试）
偷懒直接用截图
![](https://tva1.sinaimg.cn/large/00831rSTgy1gd07t5ipkoj30sc0zuwk6.jpg)

#### rm移除文件或目录
语法：`rm [选项] 文件或目录`

参数列表：
* -f ：就是 force 的意思，忽略不存在的文件，不会出现警告信息；
* -i ：互动模式，在删除前会询问使用者是否动作
* -r ：递归删除啊！最常用在目录的删除了！这是非常危险的选项！！

使用例子：
```
删除file文件：rm file
删除fileDir目录：rm -r fileDir/
强制删除file文件： rm -f file
强制删除fileDir目录：rm -rf fileDir/
```


### 文件内容查看
* cat——由第一行开始显示文件内容(参数不常用，暂不管)
* tac——与cat相反，倒着显示
* head [-n number] 文件 ——显示文件前面number行
* tail [-n number] 文件 ——显示文件后面number行
 
https://www.runoob.com/linux/linux-file-content-manage.html
## 任务管理
&，ctrl-z，ctrl-c，jobs，fg，bg，kill 等
## 网络管理
ip 或 ifconfig，dig
## yum

## 参考
* [命令行的艺术](https://github.com/jlevy/the-art-of-command-line/blob/master/README-zh.md)
* [linux教程](https://www.runoob.com/linux/linux-tutorial.html)