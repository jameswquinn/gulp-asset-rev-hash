gulp-asset-rev-hasher
=============

> Keeps a file's hash in file's links to your assets. For automatic cache updating purpose.
> Forked from https://github.com/outluch/gulp-rev-hash

## Install

```
npm install --save-dev gulp-asset-rev-hash
```


## Examples

### Default

```js
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
      removeTags: 0,
      usePale: true
    }))
    .pipe(gulp.dest('test'));
});
```

#### Input:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- start-hash -->
    <!--[if lte IE 9]>
    <link rel="stylesheet" href="/site-path/main.min.css">
    <script src="/site-path/abc.js"></script>
    <![endif]-->
    <!-- end-hash -->

    <!-- start-hash -->
    <link rel="stylesheet" href="/site-path/main.min2.css">
    <!-- end-hash -->
</head>
<body>
<!-- start-hash -->
<script src="/site-path/def.js?h=old-hash"></script>
<!-- end-hash -->
</body>
</html>
```

#### Output:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- start-hash -->
    <!--[if lte IE 9]>
    <link rel="stylesheet" href="/site-path/main.min.css?h=545778e418d1317d">
    <script src="/site-path/abc.js?h=0b0378d799c2b64e"></script>
    <![endif]-->
    <!-- end-hash -->

    <!-- start-hash -->
    <link rel="stylesheet" href="/site-path/main.min2.css?h=70931b9a8532fcce">
    <!-- end-hash -->
</head>
<body>
<!-- start-hash -->
<script src="/site-path/def.js?h=1c52f7a0f91a5d00"></script>
<!-- end-hash -->
</body>
</html>
```

### Custom options

|    option    |   type   | default |                    example                    |
|:------------:|:--------:|:-------:|:---------------------------------------------:|
|   assetsDir  |  string  |  public |                       -                       |
| assetsGetter | function |   null  | function(filePath, filePathRex, assetsDir) {} |
|  hashLength  |  number  |    32   |                       -                       |
| hashArgName  | string   | hash    | -                                             |
| removeTags   | boolean  | false   | -                                             |
| usePale      | boolean  | false   | -                                             |
