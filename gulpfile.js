var path        = require('path');
var gulp        = require('gulp');
var less = require("gulp-less");

// 表情包
/*  =S ************************************************** */ 
gulp.task('less:emotionFace', function() {
    gulp.src([basePath+'assets/*.less'])
       .pipe(less())
       .pipe(gulp.dest(basePath+'assets/'));
});
/*  =E ************************************************** */ 