/*
 * cahoots-changelog
 *
 * Copyright Cahoots.pw
 * MIT Licensed
 *
 */

/**
 * @author André König <andre@cahoots.ninja>
 *
 */

'use strict';

var path = require('path');

var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var stringify = require('stringify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var minifycss = require('gulp-minify-css');
var sequence = require('run-sequence');

var pkg = require('./package.json');

var paths = {};

paths.build = path.join(__dirname, 'build');

paths.sources = [
    path.join(__dirname, '*.js'),
    path.join(__dirname, 'lib', '**', '*.js'),
    path.join(__dirname, 'specs', '**', '*.spec.js')
];

paths.specs = [path.join(__dirname, 'specs', '**', '*.spec.js')];

gulp.task('specs', function specs () {
    return gulp.src(paths.specs, {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('lint', function lint () {
    return gulp.src(paths.sources)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('checkstyle', function checkstyle () {
    return gulp.src(paths.sources)
        .pipe(jscs());
});

gulp.task('browserify', function build () {
    var bundler = browserify({
        entries: [path.join(__dirname, pkg.main)]
    });

    bundler.transform(stringify(['.html']));

    var bundle = function b () {
        return bundler
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .bundle()
            .pipe(source(pkg.name + '.min.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest(paths.build));
    };

    return bundle();
});

gulp.task('styles', function styles () {
    return gulp.src(path.join(__dirname, 'lib', '**', '*.css'))
        .pipe(minifycss())
        .pipe(concat(pkg.name + '.min.css'))
        .pipe(gulp.dest(paths.build));
});

gulp.task('build', function build (callback) {
    return sequence('browserify', 'styles', callback);
});

gulp.task('dev', function development () {
    return gulp.watch(paths.sources, ['browserify']);
});

gulp.task('test', function test (callback) {
    return sequence('lint', 'checkstyle', 'specs', callback);
});

gulp.task('default', function defaultTask (callback) {
    return sequence('lint', 'checkstyle', 'specs', 'build', callback);
});
