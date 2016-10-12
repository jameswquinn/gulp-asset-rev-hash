var path = require('path');
var fs = require('fs');

var through = require('through2');
var gutil = require('gulp-util');

/**
 * @param {Object} [options]
 * @param {string} [options.assetsDir='public']
 * @param {Function} [options.assetsGetter] returned absolute path to file for get hash
 * @param {number} [options.hashLength=32]
 * @param {string} [options.hashArgName='hash']
 * @param {boolean} [options.removeTags=false]
 * @param {boolean} [options.usePale=false]
 * @return {Object}
 */
module.exports = function(options) {
  options = options || {};
  options.assetsDir = options.assetsDir || 'public';
  options.hashLength = options.hashLength || 32;
  options.hashArgName = options.hashArgName || 'hash';

  var paleReg = /<!--\s*start\-hash\s*-->([\s\S]*?)<!--\s*end\-hash\s*-->/gim;
  var jsReg = /(<\s*script\s+.*?src\s*=\s*")([^"]+.js)(\?.*)?(.*?".*?><\s*\/\s*script\s*>)/gi;
  var cssReg = /(<\s*link\s+.*?href\s*=\s*")([^"]+.css)(\?.*)?(.*".*?>)/gi;

  function handle(entry, prefix, path, hashStr, suffix) {

    var assetPath = options.assetsGetter
      ? options.assetsGetter(path, options.assetsDir)
      : path.join((options.assetsDir || ''), path);

    var assetContent = fs.readFileSync(assetPath, {encoding: 'utf8'});

    var hash = require('crypto')
      .createHash('md5')
      .update(assetContent)
      .digest("hex")
      .substr(-options.hashLength);

    return prefix + path + '?' + options.hashArgName + '=' + hash + suffix;
  }


  return through.obj(function(file, enc, callback) {
    if (file.isNull()) {
      this.push(file); // Do nothing if no contents
      callback();
    }
    else if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-asset-rev-hash', 'Streams are not supported!'));
      callback();
    }
    else {
      var content = String(file.contents);

      if (options.usePale) {
        content = String(file.contents)
            .replace(paleReg, function (a, b) {
              var sections = options.removeTags ? b : a;
              return sections
                  .replace(jsReg, handle)
                  .replace(cssReg, handle);
            });

        file.contents = new Buffer(content);
        this.push(file);
        return callback();
      } else {
        content = String(file.contents)
            .replace(jsReg, handle)
            .replace(cssReg, handle);
        file.contents = new Buffer(content);
        this.push(file);
        return callback();

      }

    }
  });
};
