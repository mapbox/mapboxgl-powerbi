# fast-stable-stringify

[![Build Status](https://travis-ci.org/nickyout/fast-stable-stringify.svg?branch=master)](https://travis-ci.org/nickyout/fast-stable-stringify)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/nickyout_fast-stable.svg)](https://saucelabs.com/u/nickyout_fast-stable)

_Android 4.0 is marked failing because it is slower than substack's, not because it does not work. Click on the badge(s) to inspect the test details._

The most popular repository providing this feature is [substack's json-stable-stringify][sub]. The intent if this library is to provide a faster alternative for when performance is more important than features. It assumes you provide basic javascript values without circular references, and returns a non-indented string. It currently offers a performance boost in popular browsers of about 50%.  

Usage:

```javascript
var stringify = require('fast-stable-stringify');
stringify({ d: 0, c: 1, a: 2, b: 3, e: 4 }); // '{"a":2,"b":3,"c":1,"d":0,"e":4}'
```

Just like substack's, it does:

*   handle all variations of all basic javascript values (number, string, boolean, array, object, null)
*   handle undefined in the same way as `JSON.stringify`
*	work without native access to `JSON.stringify`
*   **not support ie8 (and below) with complete certainty**. At least, his build failed on ie8.

Unlike substack's, it does:

*   not implement the 'replacer' or 'space' arguments of the JSON.stringify method
*   not check for circular references
*   not check for .toJSON() methods on objects

## Test results
Tested validity (answer equal to substack's) and benchmark (faster than substack's). A test passes only if it has the same output as substack's but is faster (as concluded by [benchmark.js][ben]). 

To (hopefully) prevent [certain smart browsers][cat] from concluding the stringification is not necessary because it is never used anywhere, I summed up all the lengths of the resulting strings of each benchmark contestant and printed it along with the result data. 

### Latest (interpreted) result

Benchmark commit e0176c7	|nickyout/fast-stable-stringify	|substack/json-stable-stringify	|last time*	|fastest*
----------------------------|-------------------------------|-------------------------------|-----------|----------
chrome 26 on Windows 10		| x 2,848 ops/sec				| x 2,277 ops/sec				|+47%		|+25%
chrome 44 on Windows 10		| x 5,573 ops/sec 				| x 3,719 ops/sec				|+41%**		|+50%
internet explorer 9 on Windows 2008	| x 5,185 ops/sec 		| x 2,633 ops/sec				|+98%		|+97%
internet explorer 10 on Windows 2012	| x 5,999 ops/sec 	| x 2,736 ops/sec				|+83%		|+119%
internet explorer 11 on Windows 10	| x 5,419 ops/sec 		| x 4,055 ops/sec				|+31%		|+34%
safari 5 on Windows 2008	| x 3,678 ops/sec				| x 1,405 ops/sec				|+144%		|+162%
safari 8.1 on Mac 10.11		| x 2,191 ops/sec 				| x 1,199 ops/sec				|+167%**	|+83%
firefox 20 on Windows 10	| x 4,253 ops/sec				| x 2,046 ops/sec				|+122%		|+108%
firefox 39 on Windows 10	| x 3,384 ops/sec				| x 2,091 ops/sec				|+55%		|+62%
opera 11 on Windows 2003	| x 453 ops/sec 				| x 339 ops/sec					|+27%		|+34%
opera 12 on Windows 2003	| x 2,768 ops/sec				| x 1,664 ops/sec				|+60%		|+66%
ipad 8.4 on Mac 10.10		| x 8,978 ops/sec				| x 3,991 ops/sec				|+15%**		|+125%
iphone 8.4 on Mac 10.10		| x 7,252 ops/sec				| x 2,935 ops/sec				|+159%**	|+147%
android 4.0 on Linux		| x 5,949 ops/sec				| x 6,092 ops/sec				|-2%		|-2%
android 5.1 on Linux		| x 5,488 ops/sec				| x 2,809 ops/sec				|+40%		|+95%

\* I did (nickyout / substack) - 1 in percentages
\**	Different 'latest version'
\*** Earliest ipad and iphone were unavailable because Sauce deprecated them. Adding for next run.

Arguably faster than last time, but more importantly, most latest versions of the most popular browsers get a bump in speed. I'll call that a win. 

See [caniuse browser usage][usg] for the 'most popular browsers'.

Click the build status badge to view the original output.

## Also
It exposes the way strings are escaped for JSON:

```javascript
var stringify = require('./'),
	stringSearch = stringify.stringSearch,
	stringReplace = stringify.stringReplace,
	str = "ay\nb0ss";
str.replace(stringSearch, stringReplace); // 'ay\\nb0ss'
```

It does NOT add the quotes before and after the string needed for JSON.stringify-ing strings. Fortunately, that isn't hard:

```javascript
'"' + str.replace(stringSearch, stringReplace) + '"'; // '"ay\\nb0ss"'
```

## Running tests
For testing in node, do:

```
npm test
```

I used [zuul][zul] for testing on saucelabs. It's a very easy to use tool, but because their library is about 150MB I did not include it in the devDepencencies. I suggest installing it globally if you want to test:

```
# install zuul
npm install -g zuul
# then, to run all tests
zuul -- test/index.js
 ```
 
## TODO

*	Test more unicode chars

[sub]: https://github.com/substack/json-stable-stringify
[ben]: https://github.com/bestiejs/benchmark.js
[cat]: http://mrale.ph/blog/2014/02/23/the-black-cat-of-microbenchmarks.html
[usg]: http://caniuse.com/usage-table
[zul]: https://github.com/defunctzombie/zuul