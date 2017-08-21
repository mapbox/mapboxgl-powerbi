# gulp-stylelint-console-reporter

[![Build Status](https://travis-ci.org/olegskl/gulp-stylelint-console-reporter.svg?branch=master)](https://travis-ci.org/olegskl/gulp-stylelint-console-reporter)
[![Code Climate](https://codeclimate.com/github/olegskl/gulp-stylelint-console-reporter/badges/gpa.svg)](https://codeclimate.com/github/olegskl/gulp-stylelint-console-reporter)

A [gulp-stylelint](https://github.com/olegskl/gulp-stylelint) reporter to display [stylelint](https://github.com/stylelint/stylelint) results in console.

## Installation

```bash
npm install gulp-stylelint-console-reporter --save-dev
```

## Quick start

```js
import gulpStylelint from 'gulp-stylelint';
import consoleReporter from 'gulp-stylelint-console-reporter';

gulp.task('lint-css', function lintCssTask() {
  return gulp
    .src('src/**/*.css')
    .pipe(gulpStylelint({
      reporters: [
        consoleReporter()
      ]
    }));
});
```

Note that if you're using ES5, you will have to access the library via the `default` property due to [the way exports are handled in Babel 6](https://phabricator.babeljs.io/T2212):

```js
var consoleReporter = require('gulp-stylelint-console-reporter').default;
```

## License

http://opensource.org/licenses/mit-license.html
