```js
var solveNQueens = function(n) {
    let board = []
    let res = []
    for (let i = 0;  i < n; i++) {
        board[i] = []
        for (let j = 0;  j < n; j++) {
            board[i][j] = '.'
        }
    }
    dfs(board, 0, n, res)
    return res
};
function dfs(board, row, n, res) {
    if (row === n) {
        let list = []
        for (let i = 0;  i < n; i++) {
            list[i] = []
            for (let j = 0;  j < n; j++) {
                list[i][j] =board[i][j]
            }
        }
        res.push(list)
        return
    }
    for (let col = 0; col < n; col++) {
        if (isOk(board, row, col)) {
            board[row][col] = 'Q'
            dfs(board, row + 1, n, res)
            board[row][col] = '.'
        }
    }
}
function isOk (board, row, col) {
    let left = row - 1
    let right = col + 1
    for (let i = row-1; i>=0; i--) { // 逐行往上考察每一行
        if (board[i][col] === 'Q') return false // 考察当前列：第i行第col有吗
        if (left >= 0) {
            if (board[i][left] === 'Q') return false // 考察左对角线：第i行第left列有吗
        }
        if (right <= 8) {
            if (board[i][right] === 'Q') return false // 考察右对角线：第i行第right列有吗
        }
        left--
        right++
    }
    return true
}
```


如果只需要一种解法，则做一些改变
```js
var solveNQueens = function(n) {
    let board = []
    let res = []
    for (let i = 0;  i < n; i++) {
        board[i] = []
        for (let j = 0;  j < n; j++) {
            board[i][j] = '.'
        }
    }
    dfs(board, 0, n, res)
    return res
};
function dfs(board, row, n, res) {
    if (row === n) {
        // let list = []
        // for (let i = 0;  i < n; i++) {
        //     list[i] = []
        //     for (let j = 0;  j < n; j++) {
        //         list[i][j] =board[i][j]
        //     }
        // }
        // res.push(list)
        // return
        res.push(board) // 不需要其他解法了，因此可以不用考虑board的引用对后续的影响
        return true
    }
    for (let col = 0; col < n; col++) {
        if (isOk(board, row, col)) {
            board[row][col] = 'Q'
            // dfs(board, row + 1, n, res)
            if (dfs(board, row + 1, n, res)) {
                return true
            }
            board[row][col] = '.'
        }
    }
}
function isOk (board, row, col) {
    let left = row - 1
    let right = col + 1
    for (let i = row-1; i>=0; i--) { // 逐行往上考察每一行
        if (board[i][col] === 'Q') return false // 考察当前列：第i行第col有吗
        if (left >= 0) {
            if (board[i][left] === 'Q') return false // 考察左对角线：第i行第left列有吗
        }
        if (right <= 8) {
            if (board[i][right] === 'Q') return false // 考察右对角线：第i行第right列有吗
        }
        left--
        right++
    }
    return true
}
```