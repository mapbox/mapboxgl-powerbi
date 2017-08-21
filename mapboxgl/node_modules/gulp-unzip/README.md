![travis](https://travis-ci.org/suisho/gulp-unzip.svg)
# gulp-unzip
> gulp plugin for unzip file.

# Usage

```js
gulp.task('filter_sample', function(){
  var minimatch = require('minimatch')
  gulp.src("./download/bootstrap-3.1.1-dist.zip")
    .pipe(unzip())
    .pipe(gulp.dest('./tmp'))
})
```

# Options

## filter

You can provide a `filter` option. It should be a function that gets an `entry` as an argument and returns `true` or `false`.

```js
var concat = require('gulp-concat')
var minimatch = require('minimatch')
gulp.task('filter_sample', function(){
  gulp.src("./download/bootstrap-3.1.1-dist.zip")
    .pipe(unzip({
      filter : function(entry){
        return minimatch(entry.path, "**/*.min.css")
      }
    }))
    .pipe(concat("bootstrap.css"))
    .pipe(gulp.dest('./tmp'))
})
```

## keepEmpty

You can provide `true` or `false` in `keepEmpty` for whether you want to extract empty files from the archive or not. Defaults to `false`.

```js
gulp.task('filter_sample', function(){
  gulp.src("./download/bootstrap-3.1.1-dist.zip")
    .pipe(unzip({ keepEmpty : true }))
    ...
})
```

# Entry

For more info, go to [node-unzip](https://github.com/EvanOxfeld/node-unzip).

- `entry.size`, returns the file size
- `entry.type`, returns `Directory` or `File`
- `entry.path`, returns the file path in the zip file

# Known issue
- Cause `RangeError: Maximum call stack size exceeded` when open large zip file
  - https://github.com/suisho/gulp-unzip/issues/2
