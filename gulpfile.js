const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const scss = require("gulp-scss");
const watch = require('gulp-watch');


gulp.task('hello_world',function(){
        console.log('my first gulp task');
});

//不壓縮 gulp css
gulp.task('scss', () => {
  //檔案來源
  return gulp
    .src(['./scss/*.scss'])
    //不執行壓縮
    .pipe(sass().on('error', sass.logError))
    //檔案完成後放置處
    .pipe(gulp.dest('./css'));
});

gulp.task('watch', function () {
    // 監看的路徑檔案以及執行sass這項task
    gulp.watch('./scss/*.scss', gulp.parallel('scss'));
});

