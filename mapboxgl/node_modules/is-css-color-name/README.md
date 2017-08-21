# is-css-color-name
[![NPM version](https://badge.fury.io/js/is-css-color-name.svg)](https://badge.fury.io/js/is-css-color-name) [![Build Status](https://travis-ci.org/dustinspecker/is-css-color-name.svg)](https://travis-ci.org/dustinspecker/is-css-color-name) [![Coverage Status](https://img.shields.io/coveralls/dustinspecker/is-css-color-name.svg)](https://coveralls.io/r/dustinspecker/is-css-color-name?branch=master)

[![Code Climate](https://codeclimate.com/github/dustinspecker/is-css-color-name/badges/gpa.svg)](https://codeclimate.com/github/dustinspecker/is-css-color-name) [![Dependencies](https://david-dm.org/dustinspecker/is-css-color-name.svg)](https://david-dm.org/dustinspecker/is-css-color-name/#info=dependencies&view=table) [![DevDependencies](https://david-dm.org/dustinspecker/is-css-color-name/dev-status.svg)](https://david-dm.org/dustinspecker/is-css-color-name/#info=devDependencies&view=table)

> Determine if a name is a valid CSS color name

## Install
```
npm install --save is-css-color-name
```

## Usage
### ES2015
```javascript
import isCSSColorName from 'is-css-color-name';

isCSSColorName(3);
// => false

isCSSColorName('unicorn');
// => false

isCSSColorName('aliceblue');
// => true
```

### ES5
```javascript
var isCSSColorName = require('is-css-color-name');

isCSSColorName(3);
// => false

isCSSColorName('unicorn');
// => false

isCSSColorName('aliceblue');
// => true
```

## LICENSE
MIT © [Dustin Specker](https://github.com/dustinspecker)