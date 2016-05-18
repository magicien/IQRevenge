// @file stylus.js
const gulp = require('gulp');
const gulpif = require('gulp-if');
const plumber = require('gulp-plumber');
const stylus = require('gulp-stylus');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const config = require('../config').stylus;

gulp.task('stylus', function() {
  gulp.src(config.src)
      .pipe(plumber())
      .pipe(stylus())
      .pipe(concat(config.output))
      .pipe(autoprefixer(config.autoprefixer))
      .pipe(gulpif(config.minify, cleancss()))
      .pipe(gulp.dest(config.dest));
});

