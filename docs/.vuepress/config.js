module.exports = {
    title: '小丸子首页', // 显示在左上角的网页名称以及首页在浏览器标签显示的title名称
    description: '小丸子的前端记录', // meta 中的描述文字，用于SEO
    // 注入到当前页面的 HTML <head> 中的标签
    head: [
        ['link', 
            { rel: 'icon', href: '/icon.jpeg' }
            //浏览器的标签栏的网页图标，第一个'/'会遍历public文件夹的文件
        ],  
    ],
    //下面涉及到的md文件和其他文件的路径下一步再详细解释
    themeConfig: {
        logo: '/icon.jpeg',  //网页顶端导航栏左上角的图标
        // lastUpdated: 'Last Updated',
        sidebarDepth: 1,
        
        //顶部导航栏
        nav: [           
            //格式一：直接跳转，'/'为不添加路由，跳转至首页
            { text: '首页', link: '/' },    
            
            //格式二：添加下拉菜单，link指向的文件路径
            {
                text: '前端',  //默认显示   
                link: '/pages/frontEnd/js基础/执行上下文栈'     
                // ariaLabel: '分类',   //用于识别的label

                // items: [
                //     { text: '文章', link: '/pages/folder1/' },  
                //     //点击标签会跳转至link的markdown文件生成的页面
                //     { text: '琐碎', link: '/pages/folder2/test4.md' },
                // ]
            },
            { text: '网络', link: '/pages/network/TCP/TCP连接的建立和断开.md' },
            { text: '浏览器', link: '/pages/browser/输入url到页面展示发生了什么.md' },
            { text: '算法', link: '/pages/algorithm/链表/2-两数相加.md' },
            { text: '其他', link: '/pages/other/linux命令行.md' },
            
            //格式三：跳转至外部网页，需http/https前缀
            { text: 'Github', link: 'https://github.com/yh418807968' },
        ],
        
        //侧边导航栏：会根据当前的文件路径是否匹配侧边栏数据，自动显示/隐藏
        sidebar: {
            '/pages/frontEnd/':[
                {
                    title: 'html',
                    children: [
                       ['html/XML、HTML、XHTML', 'XML、HTML、XHTML']
                    ]
                }, 
                {
                    title: 'css',
                    children: [
                       ['css/border实现三角形的原理', 'border实现三角形的原理']
                    ]
                },  
                {
                    title: 'js基础',
                    children: [
                       ['js基础/执行上下文栈', '执行上下文栈'],
                       ['js基础/变量对象', '变量对象'],
                       ['js基础/作用域链', '作用域链'],
                       ['js基础/this', 'this'],
                       ['js基础/闭包', '闭包'],
                    //    ['js基础/柯里化', '柯里化'],
                       ['js基础/4种循环比较', '4种循环比较'],
                       ['js基础/原型链继承', '原型链继承'],
                       ['js基础/防抖与节流', '防抖与节流'],
                       ['js基础/为什么要用Object.prototype.toString检测对象类型', '为什么要用Object.prototype.toString检测对象类型']
                    ]
                },      
                {
                    title: 'es6',   // 一级菜单名称
                    // collapsable: true, // false为默认展开菜单, 默认值true是折叠,
                    children: [
                        ['es6/手写promise', '手写promise'],
                        ['es6/let、const的暂时性死区', 'let、const的暂时性死区'],
                        ['es6/let、const', 'let、const']
                    ]
                },
                {
                    title: 'vue', 
                    sidebarDepth: 1,
                    children: [
                       ['vue/v-for为什么要加key，能用index作为key吗', 'v-for为什么要加key，能用index作为key吗'],
                       ['vue/vue为什么不能检测数组的变化', 'vue为什么不能检测数组的变化']
                    ]
                },
                {
                    title: '工程化', 
                    sidebarDepth: 1,
                    children: [
                       ['工程化/从babel谈AST', '从babel谈AST']
                    ]
                },
                {
                    title: '安全', 
                    sidebarDepth: 1,
                    children: [
                       ['安全/XSS', 'XSS'],
                       ['安全/CSRF', 'CSRF']
                    ]
                }
                
            ],
            '/pages/network/':[         
                {
                    title: 'http',   // 一级菜单名称
                    collapsable: false, // false为默认展开菜单, 默认值true是折叠,
                    sidebarDepth: 1,    //  设置侧边导航自动提取markdown文件标题的层级，默认1为h2层级
                    children: [
                        ['HTTP/https', 'https'],
                        ['HTTP/常用http头部整理', '常用http头部整理'],
                        ['HTTP/http缓存', 'http缓存'],
                        ['HTTP/各版本http对比', '各版本http对比']
                    ]
                },
                {
                    title: 'tcp/udp',
                    collapsable: false, 
                    sidebarDepth: 1,
                    children: [
                        ['TCP/TCP连接的建立和断开', 'TCP连接的建立和断开'],
                       
                    ]
                }
            ],
            '/pages/browser/': [
                 ['输入url到页面展示发生了什么', '输入url到页面展示发生了什么'],
                 ['cookie', 'cookie'],
                 ['跨域通信', '跨域通信']
            ],
            '/pages/algorithm/': [
                {
                    title: '链表', 
                    children: [
                        ['链表/2-两数相加', '2-两数相加'],
                        ['链表/19-删除链表倒数第n个节点', '19-删除链表倒数第n个节点'],
                        ['链表/21-合并两个有序链表', '21-合并两个有序链表'],
                        ['链表/141-环形链表', '141-环形链表'],
                        ['链表/160-相交链表', '160-相交链表'],
                        ['链表/203-移除链表的元素', '203-移除链表的元素'],
                        ['链表/206-反转单链表', '206-反转单链表'],
                        ['链表/234-回文链表', '234-回文链表'],
                        ['链表/237-删除链表中的节点', '237-删除链表中的节点'],
                        ['链表/707-设计链表', '707-设计链表'],
                        ['链表/876-链表的中间节点', '876-链表的中间节点']
                    ]
                },
                {
                    title: '二叉树', 
                    children: [
                        ['二叉树/94-中序遍历', '94-中序遍历'],
                        ['二叉树/102-层序遍历', '102-层序遍历'],
                        ['二叉树/103-锯齿遍历', '103-锯齿遍历'],
                        ['二叉树/104-二叉树的最大深度', '104-二叉树的最大深度'],
                        ['二叉树/112-路径总和', '112-路径总和'],
                        ['二叉树/113-路径总和2', '113-路径总和2'],
                        ['二叉树/144-前序遍历', '144-前序遍历'],
                        ['二叉树/145-后序遍历', '145-后序遍历'],
                        ['二叉树/236-二叉树的最近公共祖先', '236-二叉树的最近公共祖先']
                    ]
                },
                {
                    title: '回溯', 
                    children: [
                        ['回溯/46-全排列', '46-全排列'],
                        ['回溯/77-组合', '77-组合'],
                        ['回溯/78-子集', '78-子集'],
                        ['回溯/八皇后', '八皇后']
                    ]
                },
                {
                    title: '动态规划', 
                    children: [
                        ['动态规划/70-爬楼梯', '70-爬楼梯'],
                        ['动态规划/72-编辑距离', '72-编辑距离'],
                        ['动态规划/120-三角形最小路径和', '120-三角形最小路径和'],
                        ['动态规划/121-买卖股票的最佳时机', '121-买卖股票的最佳时机'],
                        ['动态规划/122-买卖股票的最佳时机2', '122-买卖股票的最佳时机2'],
                        ['动态规划/1143-最长公共子序列', '1143-最长公共子序列']
                    ]
                },
                {
                    title: '排序', 
                    children: [
                        ['排序/归并排序', '归并排序'],
                        ['排序/快速排序', '快速排序'],
                        ['排序/冒泡排序', '冒泡排序']
                    ]
                }
            ],
            '/pages/other/': [
                { 
                    title: '工具类',
                    // sidebarDepth: 1,
                    children: [
                        ['linux命令行', 'linux命令行'],
                        ['Base64', 'Base64'],
                        ['ASCII、Unicode', 'ASCII、Unicode']
                    ]
                }
            ]
            
            //...可添加多个不同的侧边栏，不同页面会根据路径显示不同的侧边栏
        }
    }
}