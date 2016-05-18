// @file esdoc.js
const gulp = require('gulp');
const esdoc = require('gulp-esdoc');
const config = require('../config');

gulp.task('esdoc', function() {
  gulp.src(config.js.src)
      .pipe(esdoc(config.esdoc));
});

gulp.task('doc', ['esdoc']);

