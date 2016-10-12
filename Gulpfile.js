var gulp = require('gulp');
var rev = require('./index');

gulp.task('test', function () {
  gulp.src('test/index.html')
    .pipe(rev({
      assetsGetter: function (filePath) {
        return filePath.replace('/site-path', 'test/bundle')
      },
      hashLength: 16,
      hashArgName: 'h',
      usePale: true
    }))
    .pipe(gulp.dest('test'));
});
