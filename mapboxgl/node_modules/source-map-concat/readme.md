Overview [![Build Status](https://travis-ci.org/lydell/source-map-concat.svg?branch=master)](https://travis-ci.org/lydell/source-map-concat)
========

Concatenate files with source maps.

```js
var fs     = require("fs")
var path   = require("path")
var concat = require("source-map-concat")

var resolveSourceMapSync = require("source-map-resolve").resolveSourceMapSync
var createDummySourceMap = require("source-map-dummy")

var jsFiles = ["foo.js", "subdir/bar.js", "../baz.js"]

jsFiles = jsFiles.map(function(file) {
  return {
    source:  file,
    code: fs.readFileSync(file).toString()
  }
})
jsFiles.forEach(function(file) {
  var previousMap = resolveSourceMapSync(file.code, file.source, fs.readFileSync)
  if (previousMap) {
    file.map = previousMap.map
    file.sourcesRelativeTo = previousMap.sourcesRelativeTo
  } else {
    file.map = createDummySourceMap(file.code, {source: file.source, type: "js"})
  }
})

function wrap(node, file) {
  node.prepend("void function(){\n// File: " + file.source + "\n")
  node.add("}();")
}

var output = "subdir/bundle.js"

var concatenated = concat(jsFiles, {
  delimiter: "\n",
  process: wrap,
  mapPath: output + ".map"
})

concatenated.prepend("/* Bruce Banner */\n")
concatenated.add("\n/* Footer */")

var result = concatenated.toStringWithSourceMap({
  file: path.basename(output)
})

fs.writeFileSync(output, result.code)
fs.writeFileSync(output + ".map", result.map.toString())
```


Installation
============

`npm install source-map-concat`

```js
var concat = require("source-map-concat")
```


Usage
=====

### `concat(files, options)` ###

`files` is an array of objects with the following properties:

- `code`: The contents of the file, as a string.
- `map`: The source map of the file, if any, as an object, a string or anything
  with a `.toJSON()` method (such as a [`SourceMapGenerator`]). It could be
  taken straight from a compiler, be resolved using [source-map-resolve] or
  created using [source-map-dummy].
- `sourcesRelativeTo`: A path that `file.map.sources` are relative to. Defaults
  to `.`.

`options`:

- `delimiter`: A string to insert between each file.
- `process(node, file, index)`: A function to call on each file in `files`.
  `node` is a [`SourceNode`]. You could use this to wrap JavaScript files in
  IIFEs, for example.
- `mapPath`: The path to where you intend to write the source map of the
  produced concatenated file. Defaults to `.`.

The files in `files` will be concatenated into a [`SourceNode`] which is
returned. You may then modify this source node if you wish (`node.add(...)` for
example). When you’re done, call `node.toStringWithSourceMap()`, which returns
an object with a `code` property containing the concatenated code, and a `map`
property containing the source map.

[source-map-resolve]: https://github.com/lydell/source-map-resolve
[source-map-dummy]: https://github.com/lydell/source-map-dummy
[`SourceNode`]: https://github.com/mozilla/source-map#sourcenode
[`SourceMapGenerator`]: https://github.com/mozilla/source-map#sourcemapgenerator


License
=======

[The X11 (“MIT”) License](LICENSE).
