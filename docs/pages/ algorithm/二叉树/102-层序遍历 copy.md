[102-二叉树的层序遍历](https://leetcode-cn.com/problems/binary-tree-level-order-traversal/)

## 题解

### 代码
```js
var levelOrder = function(root) {
    if (root === null) return []
    let queue = []
    let output = []
    queue.push(root)
    while(queue.length){
        const length = queue.length
        const list = []
        for(let i = 0;i<length;i++){
            const node = queue.shift()
            list.push(node.val)
            if (node.left !== null)queue.push(node.left)
            if (node.right !== null)queue.push(node.right) 
        }
        output.push(list)
    }
    return output
    
};

```


### 思路分析-迭代方案

### 复杂度分析
#### 时间复杂度
#### 空间复杂度