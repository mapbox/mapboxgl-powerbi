# gulp-using

Gulp filter. Lists all files used. Helps you to verify what your patterns catch

## Install

```
npm install --save-dev gulp-using
```

## Example

After some complex `src` patterns, and some added filter plugins, it helps you to list all files catched

```js
const using = require('gulp-using')

var jsfiles = ['./src/js/**/*.js', '!./src/js/vendor/**']

gulp.task('default', function() {
  gulp.watch(jsfiles, function() {
    gulp.src(jsfiles)
      // action or filter...
      .pipe(using())
      // ...
  })
})
```

Output:

```
[12:18:43] Running 'default'...
[12:18:43] Finished 'default' in 14 ms
[12:18:43] Using ./src/js/index.js
[12:18:43] Using ./src/js/multiply.js
[12:18:43] Using ./src/js/square.js
```

## Options

#### path

How the file path is displayed

* Type: `String`
* Default: `cwd`
* Values: `cwd`, `path`, `relative`

#### color

How the file path is colored

* Type: `String`
* Default: `magenta`
* Values: `black`, `blue`, `cyan`, `gray`, `green`, `magenta`, `red`, `white`, `yellow`

#### prefix

Message shown before the file path

* Type: `String`
* Default: `Using`

```js
// ...
.pipe(using({prefix:'Using file', path:'relative', color:'blue'}))
```

Output:

```
[12:18:43] Running 'default'...
[12:18:43] Finished 'default' in 14 ms
[12:18:43] Using file index.js
[12:18:43] Using file multiply.js
[12:18:43] Using file square.js
```
