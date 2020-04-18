```js
Funtion.prototype.bind = fuction (ctx) {
	const self = this
	const args = Array.prototype.slice.call(arguments, 1)
	return function () {
		const allArgs = args.concat(Array.prototype.slice.call(arguments));
		this.apply(ctx, allArgs)
	}
}
```
更多参见https://github.com/mqyqingfeng/Blog/issues/12