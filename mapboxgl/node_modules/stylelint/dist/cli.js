#!/usr/bin/env node
"use strict";

var _meow = require("meow");

var _meow2 = _interopRequireDefault(_meow);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _lodash = require("lodash");

var _getStdin = require("get-stdin");

var _getStdin2 = _interopRequireDefault(_getStdin);

var _resolveFrom = require("resolve-from");

var _resolveFrom2 = _interopRequireDefault(_resolveFrom);

var _standalone = require("./standalone");

var _standalone2 = _interopRequireDefault(_standalone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var minimistOptions = {
  default: {
    f: "string",
    q: false,
    config: false,
    v: false
  },
  alias: {
    f: "formatter",
    q: "quiet",
    s: "syntax",
    v: "verbose"
  }
};
var syntaxOptions = ["scss"];

var meowOptions = {
  help: ["Usage", "  stylelint [input] [options]", "", "Input", "  Files(s) or glob(s).", "  If an input argument is wrapped in quotation marks, it will be passed to node-glob", "  for cross-platform glob support.", "  `node_modules` and `bower_components` are always ignored.", "  You can also pass no input and use stdin, instead.", "", "Options", "  --config            Path to a specific configuration file (JSON, YAML, or CommonJS),", "                      or the name of a module in `node_modules` that points to one.", "                      If no `--config` argument is provided, stylelint will search for", "                      configuration  files in the following places, in this order:", "                        - a `stylelint` property in `package.json`", "                        - a `.stylelintrc` file (with or without filename extension:", "                          `.json`, `.yaml`, and `.js` are available)", "                        - a `stylelint.config.js` file exporting a JS object", "                      The search will begin in the working directory and move up the", "                      directory tree until a configuration file is found.", "  --version           Get the currently installed version of stylelint.", "  --custom-formatter  Path to a JS file exporting a custom formatting function", "  -f, --formatter     Specify a formatter: \"json\" or \"string\". Default is \"string\".", "  -q, --quiet         Only register warnings for rules with an \"error\"-level severity", "                      (ignore \"warning\"-level)", "  -s, --syntax        Specify a non-standard syntax that should be used to ", "                      parse source stylesheets. Options: \"scss\"", "  -v, --verbose       Get more stats"],
  pkg: "../package.json"
};

var cli = (0, _meow2.default)(meowOptions, minimistOptions);

var formatter = cli.flags.formatter;
if (cli.flags.customFormatter) {
  formatter = require(_path2.default.join(process.cwd(), cli.flags.customFormatter));
} else if (cli.flags.verbose) {
  formatter = "verbose";
}

var optionsBase = {
  formatter: formatter,
  configOverrides: {}
};

if (cli.flags.quiet) {
  optionsBase.configOverrides.quiet = cli.flags.quiet;
}

if (cli.flags.syntax && (0, _lodash.includes)(syntaxOptions, cli.flags.syntax)) {
  optionsBase.syntax = cli.flags.syntax;
}

if (cli.flags.config) {
  // Should check these possibilities:
  //   a. name of a node_module
  //   b. absolute path
  //   c. relative path relative to `process.cwd()`.
  // If none of the above work, we'll try a relative path starting
  // in `process.cwd()`.
  optionsBase.configFile = (0, _resolveFrom2.default)(process.cwd(), cli.flags.config) || _path2.default.join(process.cwd(), cli.flags.config);
}

Promise.resolve().then(function () {
  // Add input/code into options
  if (cli.input.length) {
    return (0, _lodash.assign)({}, optionsBase, {
      files: cli.input
    });
  }
  return (0, _getStdin2.default)().then(function (stdin) {
    return (0, _lodash.assign)({}, optionsBase, {
      code: stdin
    });
  });
}).then(function (options) {
  return (0, _standalone2.default)(options);
}).then(function (_ref) {
  var output = _ref.output;
  var errored = _ref.errored;

  if (!output) {
    return;
  }
  process.stdout.write(output);
  if (errored) {
    process.exit(2);
  }
}).catch(function (err) {
  console.log(err.stack); // eslint-disable-line no-console
  process.exit(err.code || 1);
});