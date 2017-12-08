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
  var urlReg = /(url\s*?\(['"]?)([^'"\)]+\.[a-z0-9]+).*?(['"]?\))/gi;

  function resetCache() {
    cache = {};
  }

  function handle(content, ext, dir) {
    switch (ext) {
      case '.css':
        return content
            .replace(urlReg, repl.bind(null, dir));
      default:
        return content
            .replace(jsReg, repl.bind(null, dir))
            .replace(cssReg, repl.bind(null, dir));
    }
  }

  function repl(dir, entry, prefix, p, suffix) {

    // skip data-url
    if(p.indexOf('data:') === 0) {
      return entry;
    }

    // skip extarnal urls
    if(p.indexOf('http') === 0) {
      return entry;
    }

    var assetPath;

    if (options.assetsGetter) {
      assetPath = options.assetsGetter(p, options.assetsDir)
    } else {
      assetPath = path.isAbsolute(p)
        ? path.join((options.assetsDir || ''), p)
        : path.join(dir, p);
    }

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

    return prefix + p + '?' + options.hashArgName + '=' + hash + suffix;
  }


  return through.obj(function(file, enc, callback) {
    var dir = path.dirname(file.path);
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
        content = content.replace(paleReg, function (a, b) {
          var sections = options.removeTags ? b : a;
          return handle(sections, ext, dir);
        });
      } else {
        content = handle(content, ext, dir);
      }
      file.contents = new Buffer(content);
      this.push(file);
      callback();

      resetCache();
    }
  });
};
