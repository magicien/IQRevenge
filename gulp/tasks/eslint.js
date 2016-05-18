// @file eslint.js
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const config = require('../config');

gulp.task('eslint', function() {
  return gulp.src(config.eslint.src)
    .pipe(eslint(config.eslint.opts))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint', ['eslint']);

