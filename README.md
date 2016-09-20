gulp-asset-rev-hash
=============

> Keeps a file's hash in file's links to your assets. For automatic cache updating purpose.
> Fork from gulp-rev-hash

## Install

```
npm install --save-dev gulp-asset-rev-hash
```


## Examples

### Default

```js
var gulp = require('gulp');
var assetHash = require('gulp-asset-rev-hash');

gulp.task('rev-hash', function () {
	gulp.src('src/index.html')
		.pipe(assetHash())
		.pipe(gulp.dest('src'));
});
```

#### Input:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- start-hash -->
    <link rel="stylesheet" href="main.min.css" media="screen" />
    <script src="abc.js"></script>
    <!-- end-hash -->

    <!-- start-hash -->
    <link rel="stylesheet" href="main.min2.css" media="print">
    <!-- end-hash -->
    </head>
<body>
<!-- start-hash -->
<script src="def.js"></script>
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
    <link rel="stylesheet" href="main.min.css?h=9a08514aab0cb538" media="screen" />
    <script src="abc.js?h=0b0378d799c2b64e"></script>
    <!-- end-hash -->

    <!-- start-hash -->
    <link rel="stylesheet" href="main.min2.css?h=70931b9a8532fcce" media="print">
    <!-- end-hash -->
    </head>
<body>
<!-- start-hash -->
<script src="def.js?h=1c52f7a0f91a5d00"></script>
<!-- end-hash -->
</body>
</html>
```

### Custom options

```
assetsDir: 'public'
assetsGetter: function(filePath, filePathRex, assetsDir) {}
hashLength: 16
hashArgName: 'hash'
```
