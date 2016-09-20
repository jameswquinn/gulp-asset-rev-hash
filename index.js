var path = require('path');
var fs = require('fs');

var through = require('through2');
var gutil = require('gulp-util');

/**
 * @param {Object} [options]
 * @param {string} [options.assetsDir]
 * @param {Function} [options.assetsGetter] returned absolute path to file for get hash
 * @param {number} [options.hashLength=32]
 * @param {string} [options.hashArgName='hash']
 * @return {Object}
 */
module.exports = function(options) {
  options = options || {};
  options.hashLength = options.hashLength || 32;
  options.hashArgName = options.hashArgName || 'hash';

  var startReg = /<!--\s*start\-hash\s*-->/gim;
  var endReg = /<!--\s*end\-hash\s*-->/gim;
  var jsAndCssReg = /<\s*script\s+.*?src\s*=\s*"([^"]+.js).*?".*?><\s*\/\s*script\s*>|<\s*link\s+.*?href\s*=\s*"([^"]+.css).*".*?>/gi;
  var regSpecialsReg = /([.?*+^$[\]\\(){}|-])/g;

  function getTags(content) {
    var tags = [];

    content
      .replace(/<!--(?:(?:.|\r|\n)*?)-->/gim, '')
      .replace(jsAndCssReg, function (a, b, c) {
        tags.push({
          html: a,
          path: b || c,
          pathReg: new RegExp(escapeRegSpecials(b || c) + '.*?"', 'g')
        });
      });

    return tags;
  }

  function escapeRegSpecials(str) {
    return (str + '').replace(regSpecialsReg, "\\$1");
  }

  return through.obj(function(file, enc, callback) {
    if (file.isNull()) {
      this.push(file); // Do nothing if no contents
      callback();
    }
    else if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-usemin', 'Streams are not supported!')); //todo name
      callback();
    }
    else {

      var html = [];
      var sections = String(file.contents).split(endReg);

      for (var i = 0, l = sections.length; i < l; ++i) {
        if (sections[i].match(startReg)) {
          var tag;
          var section = sections[i].split(startReg);
          var tags = getTags(section[1]);
          html.push(section[0]);
          html.push('<!-- start-hash -->\r\n');
          for (var j = 0; j < tags.length; j++) {
            tag = tags[j];
            var filePath = options.assetsGetter
                ? options.assetsGetter(tag.path, tag.pathReg, options.assetsDir)
                : path.join((options.assetsDir ? options.assetsDir:''), tag.path);
            var hash = require('crypto')
              .createHash('md5')
              .update(fs.readFileSync(filePath, {encoding: 'utf8'}))
              .digest("hex")
              .substr(-options.hashLength);
            var assetPath = tag.path + '?' +  options.hashArgName + '=' + hash;
            html.push(tag.html.replace(tag.pathReg, assetPath + '"') + '\r\n');
          }
          html.push('<!-- end-hash -->');
        }
        else { html.push(sections[i]); }
      }
      file.contents = new Buffer(html.join(''));
      this.push(file);
      return callback();
    }
  });
};
