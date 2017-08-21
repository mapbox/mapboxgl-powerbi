var path = require('path');
var flowRemoveTypes = require('flow-remove-types');
var through = require('through');

var defaultOptions = {
  extensions: [ '.js', '.jsx', '.flow' ]
};

module.exports = function unflowify(filename, options) {
  options = Object.assign({}, defaultOptions, options);

  if (options.extensions &&
      options.extensions.indexOf(path.extname(filename)) === -1) {
    return through();
  }

  var file = [];

  function write(chunk) {
    if (!Buffer.isBuffer(chunk)) {
      chunk = Buffer.from(chunk)
    }
    return file.push(chunk)
  }

  function transform() {
    var source = Buffer.concat(file).toString('utf8');
    try {
      this.queue(flowRemoveTypes(source, options).toString());
      this.queue(null);
    } catch (error) {
      error.message = filename + ': ' + error.message;
      error.fileName = filename;
      this.emit('error', error);
    }
  }

  return through(write, transform);
}
