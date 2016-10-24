var path = require('path');
var fs = require('fs');
var crypto = require('crypto');

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
 * @param {boolean} [options.ignoreCache=false]
 * @return {Object}
 */
module.exports = function(options) {
  options = options || {};
  options.assetsDir = options.assetsDir || 'public';
  options.hashLength = options.hashLength || 32;
  options.hashArgName = options.hashArgName || 'hash';

  var cache = {};
  var paleReg = /<!--\s*start\-hash\s*-->([\s\S]*?)<!--\s*end\-hash\s*-->/gim;
  var jsReg = /(<\s*script.*?\s+src\s*=\s*")([^"]+.js).*?(".*?><\s*?\/\s*?script\s*>)/gi;
  var cssReg = /(<\s*?link.*?\s+href\s*?=\s*?")([^"]+.css).*?(".*?>)/gi;
  var urlReg = /(:\s*?url\s*?\(['"]?)([^'"\)]+\.[a-z0-9]+).*?(['"]?\).*?;)/gi;

  function resetCache() {
    cache = {};
  }

  function handle(content, ext) {
    switch (ext) {
      case '.css':
        return content
            .replace(urlReg, repl);
      default:
        return content
            .replace(jsReg, repl)
            .replace(cssReg, repl);
    }
  }

  function repl(entry, prefix, path, suffix) {

    var assetPath = options.assetsGetter
        ? options.assetsGetter(path, options.assetsDir)
        : path.join((options.assetsDir || ''), path);

    var hash;

    if (cache[assetPath] && !options.ignoreCache) {
      hash = cache[assetPath]
    } else {
      var assetContent = fs.readFileSync(assetPath, {encoding: 'utf8'});
      hash = crypto
          .createHash('md5')
          .update(assetContent)
          .digest("hex")
          .substr(-options.hashLength);

      cache[assetPath] = hash;
    }

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
      var ext = path.extname(file.path);

      if (options.usePale) {
        content = contents.replace(paleReg, function (a, b) {
          var sections = options.removeTags ? b : a;
          return handle(sections, ext);
        });
      } else {
        content = handle(content, ext);
      }
      file.contents = new Buffer(content);
      this.push(file);
      callback();

      resetCache();
    }
  });
};
