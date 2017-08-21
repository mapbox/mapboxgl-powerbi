
const chalk = require('chalk')
const map   = require('map-stream')

module.exports = function(options) {
  options = options || {}

  var paths  = 'path relative'.split(' ')
  var colors = 'black blue cyan gray green red white yellow'.split(' ')

  options.prefix = options.prefix || 'Using'
  options.path   = paths.indexOf(options.path) != -1 ? options.path : 'cwd'
  options.color  = colors.indexOf(options.color) != -1 ? options.color : 'magenta'

  return map(function(file, cb) {

    var f = file.path.replace(file.cwd, '.')
    if (options.path == 'relative')  { f = file.relative }
    else if (options.path == 'path') { f = file.path }

    var time = '['+chalk.gray(new Date().toTimeString().slice(0, 8))+']'

    console.log(time, options.prefix, chalk[options.color](f))

    cb(null, file)
  })
}
