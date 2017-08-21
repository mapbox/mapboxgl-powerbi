"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var files = _ref.files;
  var code = _ref.code;
  var codeFilename = _ref.codeFilename;
  var config = _ref.config;
  var configFile = _ref.configFile;
  var configBasedir = _ref.configBasedir;
  var configOverrides = _ref.configOverrides;
  var syntax = _ref.syntax;
  var _ref$formatter = _ref.formatter;
  var formatter = _ref$formatter === undefined ? "json" : _ref$formatter;

  var isValidCode = typeof code === "string";
  if (!files && !isValidCode || files && (code || isValidCode)) {
    throw new Error("You must pass stylelint a `files` glob or a `code` string, though not both");
  }

  var chosenFormatter = typeof formatter === "string" ? formatters[formatter] : formatter;

  var errored = false;

  if (!files) {
    return lintString(code, codeFilename).then(function (result) {
      var results = [result];
      var output = chosenFormatter(results);
      return {
        output: output,
        results: results,
        errored: errored
      };
    });
  }

  return (0, _globby2.default)([].concat(files, ignoredGlobs)).then(function (input) {
    if (!input.length) {
      var err = new Error("Files glob patterns specified did not match any files");
      err.code = 80;
      throw err;
    }
    var promises = input.map(function (filepath) {
      return lintFile(filepath);
    });
    return Promise.all(promises).then(function (results) {
      var output = chosenFormatter(results);
      return {
        output: output,
        results: results,
        errored: errored
      };
    });
  });

  function lintFile(filepath) {
    return new Promise(function (resolve, reject) {
      (0, _fs.readFile)(filepath, "utf8", function (err, code) {
        if (err) {
          return reject(err);
        }
        resolve(code);
      });
    }).then(function (code) {
      return lintString(code, filepath);
    });
  }

  function lintString(code, filepath) {
    var postcssProcessOptions = {};
    if (filepath) {
      postcssProcessOptions.from = filepath;
    }
    if (syntax === "scss") {
      postcssProcessOptions.syntax = _postcssScss2.default;
    }

    return (0, _postcss2.default)().use((0, _postcssPlugin2.default)({
      config: config,
      configFile: configFile,
      configBasedir: configBasedir,
      configOverrides: configOverrides
    })).process(code, postcssProcessOptions).then(handleResult);

    function handleResult(postcssResult) {
      var source = !postcssResult.root.source ? undefined : postcssResult.root.source.input.file || postcssResult.root.source.input.id;

      if (postcssResult.stylelint.stylelintError) {
        errored = true;
      }

      // Strip out deprecation warnings from the messages
      var deprecations = _lodash2.default.remove(postcssResult.messages, { stylelintType: "deprecation" }).map(function (d) {
        return {
          text: d.text,
          reference: d.stylelintReference
        };
      });

      // Also strip out invalid options
      var invalidOptionWarnings = _lodash2.default.remove(postcssResult.messages, { stylelintType: "invalidOption" }).map(function (w) {
        return { text: w.text };
      });

      return {
        source: source,
        deprecations: deprecations,
        invalidOptionWarnings: invalidOptionWarnings,
        errored: postcssResult.stylelint.stylelintError,
        warnings: postcssResult.messages.map(function (message) {
          return {
            line: message.line,
            column: message.column,
            rule: message.rule,
            severity: message.severity,
            text: message.text
          };
        })
      };
    }
  }
};

var _postcss = require("postcss");

var _postcss2 = _interopRequireDefault(_postcss);

var _globby = require("globby");

var _globby2 = _interopRequireDefault(_globby);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require("fs");

var _postcssScss = require("postcss-scss");

var _postcssScss2 = _interopRequireDefault(_postcssScss);

var _postcssPlugin = require("./postcssPlugin");

var _postcssPlugin2 = _interopRequireDefault(_postcssPlugin);

var _formatters = require("./formatters");

var formatters = _interopRequireWildcard(_formatters);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ignoredGlobs = ["!**/node_modules/**", "!**/bower_components/**"];