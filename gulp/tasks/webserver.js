// @file webserver.js
const gulp = require('gulp');
const config = require('../config').webserver;
const webserver = require('gulp-webserver');

gulp.task('webserver', function(done) {
  gulp.src(config.src)
      .pipe(webserver(config.webserver));
})

