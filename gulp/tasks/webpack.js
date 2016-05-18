// @file webpack.js
const gulp = require('gulp');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const webpack = require('gulp-webpack');
const config = require('../config');
const exec = require('child_process').exec;

gulp.task('webpack', function(cb) {
  gulp.src(config.webpack.entry)
      .pipe(webpack(config.webpack))
      .pipe(gulpif(config.js.uglify, uglify()))
      .pipe(gulp.dest(config.js.dest));
});

