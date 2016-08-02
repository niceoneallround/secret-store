'use strict';
const gulp = require('gulp');
const gulpNSP = require('gulp-nsp');
const istanbul = require('gulp-istanbul');
const jshint = require('gulp-jshint');
const jscs = require('gulp-jscs');
const mocha = require('gulp-mocha');

gulp.task('nsp', function (cb) {
  gulpNSP({ package: __dirname + '/package.json' }, cb);
});

gulp.task('tjshint', function () {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('tjscs', function () {
  return gulp.src('./lib/*.js')
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'));
});

gulp.task('pre-test', function () {
  return gulp.src('./lib/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src('./test/*.js')
    .pipe(mocha())
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('build', ['tjshint', 'tjscs', 'test']);
gulp.task('release', ['build', 'nsp']);

gulp.task('default', ['build']);
