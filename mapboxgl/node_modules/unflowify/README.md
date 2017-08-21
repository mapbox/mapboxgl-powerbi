unflowify
=========

This [Browserify](http://browserify.org/) transform will remove
[Flow](https://flowtype.org) type annotations during using [`flow-remove-types`](https://github.com/leebyron/flow-remove-types).

## Install

```
npm install --save unflowify
```

**Command Line**

```
browserify -t unflowify main.js
```

**Browserify API**

```js
var unflowify = require('unflowify')

var b = browserify()
b.add('input.js')
b.transform(unflowify)
```
