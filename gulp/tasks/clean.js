// @file copy.js
const gulp = require('gulp');
const del = require('del');
const config = require('../config').clean;

gulp.task('clean', function() {
  del.sync(config.src);
});

