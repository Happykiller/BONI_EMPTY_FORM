/* jshint node:true */

'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var launch = require('gulp-open');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var gulp = require('gulp-param')(require('gulp'), process.argv);

var OdaGulpConfig = {
    "vendorName" : "bower_components"
};

gulp.task('params', function(vendorName) {
    if(vendorName !== null){
        OdaGulpConfig.vendorName = vendorName;
    }
    return;
});

//ex : gulp install-full --vendorName libs
gulp.task('install-full', ['params'], function() {
    gulp.src(['full/index.html','full/gulpfile.js','full/package.json','full/jsTestDriver.conf'])
        .pipe(replace(/vendor/g, OdaGulpConfig.vendorName))
        .pipe(gulp.dest('./../../../'));
    gulp.src(['!full/index.html','!full/gulpfile.js','!full/package.json','!full/jsTestDriver.conf','full/**/*'])
        .pipe(gulp.dest('./../../../'));
    return;
});

//ex : gulp install-full --vendorName libs
gulp.task('install-app', ['params'], function() {
    gulp.src(['app/index.html','app/gulpfile.js','app/package.json','app/jsTestDriver.conf'])
        .pipe(replace(/vendor/g, OdaGulpConfig.vendorName))
        .pipe(gulp.dest('./../../../'));
    gulp.src(['!app/index.html','!app/gulpfile.js','!app/package.json','!app/jsTestDriver.conf','app/**/*'])
        .pipe(gulp.dest('./../../../'));
    return;
});

//ex : gulp install-full --vendorName libs
gulp.task('install-mini', ['params'], function() {
    gulp.src(['mini/index.html','mini/gulpfile.js','mini/package.json','mini/jsTestDriver.conf'])
        .pipe(replace(/vendor/g, OdaGulpConfig.vendorName))
        .pipe(gulp.dest('./../../../'));
    gulp.src(['!mini/index.html','!mini/gulpfile.js','!mini/package.json','!mini/jsTestDriver.conf','mini/**/*'])
        .pipe(gulp.dest('./../../../'));
    return;
});