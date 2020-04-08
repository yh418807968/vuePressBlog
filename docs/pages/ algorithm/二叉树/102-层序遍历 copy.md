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
            node.left && queue.push(node.left)
            node.right && queue.push(node.right) 
        }
        output.push(list)
    }
    return output   
};

```


### 思路分析
从层序遍历的顺序来看，是先进先出，因此需要采用队列。每次shift一个节点时，就要将其左子树和右字数push进队列


### 复杂度分析
#### 时间复杂度
每个节点会被运算1次，时间复杂度O(n)
#### 空间复杂度
输出的结果需要保存n个节点，空间复杂度为O(n)