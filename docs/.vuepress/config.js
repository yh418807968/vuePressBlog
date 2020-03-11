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
        lastUpdated: 'Last Updated',
        sidebarDepth: 1,
        
        //顶部导航栏
        nav: [           
            //格式一：直接跳转，'/'为不添加路由，跳转至首页
            { text: '首页', link: '/' },    
            
            //格式二：添加下拉菜单，link指向的文件路径
            {
                text: '前端',  //默认显示   
                link: '/pages/frontEnd/es6/'     
                // ariaLabel: '分类',   //用于识别的label

                // items: [
                //     { text: '文章', link: '/pages/folder1/' },  
                //     //点击标签会跳转至link的markdown文件生成的页面
                //     { text: '琐碎', link: '/pages/folder2/test4.md' },
                // ]
            },
            { text: '网络', link: '/pages/network/test1.md' },
            
            //格式三：跳转至外部网页，需http/https前缀
            { text: 'Github', link: 'https://github.com/yh418807968' },
        ],
        
        //侧边导航栏：会根据当前的文件路径是否匹配侧边栏数据，自动显示/隐藏
        sidebar: {
            '/pages/frontEnd/':[
                {
                    title: 'html',
                    children: [
                       
                    ]
                }, 
                {
                    title: 'css',
                    children: [
                       
                    ]
                },  
                {
                    title: 'js基础',
                    children: [
                       
                    ]
                },      
                {
                    title: 'es6',   // 一级菜单名称
                    collapsable: false, // false为默认展开菜单, 默认值true是折叠,
                    children: [
                        ['es6/手写promise.md', '手写promise']
                    ]
                },
                {
                    title: 'vue', 
                    sidebarDepth: 1,
                    children: [
                       
                    ]
                },
                
            ],
            '/pages/network/':[         
                {
                    title: 'http',   // 一级菜单名称
                    collapsable: false, // false为默认展开菜单, 默认值true是折叠,
                    sidebarDepth: 1,    //  设置侧边导航自动提取markdown文件标题的层级，默认1为h2层级
                    children: [
                        
                    ]
                },
                {
                    title: 'tcp/udp',
                    collapsable: false, 
                    sidebarDepth: 1,
                    children: [
                       
                    ]
                }
            ],
            
            //...可添加多个不同的侧边栏，不同页面会根据路径显示不同的侧边栏
        }
    }
}