// @file test.js
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const util = require('gulp-util');
const config = require('../config');

gulp.task('test', function() {
  return gulp.src(config.mocha.src, {read: false})
             .pipe(mocha(config.mocha.opts))
             .on('error', util.log);
});

