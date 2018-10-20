"use strict";

const gulp = require('gulp');
const debug = require('gulp-debug');
const browserify = require("browserify");
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const tsify = require("tsify");
const buffer = require('vinyl-buffer');


const compile = function (entryPoint, output) {
    const compiled = browserify({
        basedir: '.',
        debug: true,
        entries: [entryPoint],
        cache: {},
        packageCache: {}
    }).plugin(tsify, {
        global: true,
        target: 'es6'
    });

    return compiled
        .bundle()
        .pipe(source(output))
        .pipe(debug({title: 'file:'}))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest("dist/lib"));
};

gulp.task('scripts', function () {
    compile('src/report/index.ts', 'report.js');
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('default', ['scripts']);
