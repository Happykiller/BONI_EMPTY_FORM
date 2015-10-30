/* jshint node:true */

'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var open = require('gulp-open');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');

var paths = {
    sources : [
        '!bower_components/',
        '!bower_components/**/*',
        '*',
        '**/*'
    ]
};

var opt = {
    port: 3000,
    livereload: 31357
};

/**
 * bower task
 * Fetch bower dependencies
 */
gulp.task('bower', function() {
    bower();
});

/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task('watch', function() {
    gulp
        .watch(paths.sources)
        .on('change', function() {
            gulp.src('').pipe(connect.reload());
        })
    ;
});

/**
 * Server task
 */
gulp.task('server', function() {
    return connect.server({
        root: ['src', '.'],
        port: opt.port,
        livereload: true
    });
});

/**
 * Open task
 * Launch default browser on local server url
 */
gulp.task('open', function() {
    return gulp.src('index.html').pipe(open({uri: 'http://localhost:'+opt.port}));
});

gulp.task('run-dev', ['bower', 'watch', 'server', 'open']);
