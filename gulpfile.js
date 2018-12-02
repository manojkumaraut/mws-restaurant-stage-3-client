var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins')
var fs = require('fs');
var del = require('del');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var runSequence = require('run-sequence');
var lazypipe = require('lazypipe');
var browserSync = require('browser-sync').create();
var gulpif = require('gulp-if');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

// Lint JavaScript
gulp.task('lint', function () {
  return gulp.src(['app/*.js', '!node_modules/**'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

// Prep assets for dev
gulp.task('html', function () {

  return gulp.src('app/*.html')
    .pipe(gulpif('*.css', $.autoprefixer()))
    .pipe(gulpif('*.js', $.babel()))
    .pipe(gulpif('*.html', $.htmlmin({
      removeComments: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))

    .pipe(gulp.dest('.tmp'));
});

// Scan HTML for js & css and optimize them
gulp.task('html:dist', function () {
  return gulp.src('app/*.html')
    .pipe($.size({title: 'html (before)'}))
    .pipe(gulpif('*.css', $.size({ title: 'styles (before)' })))
    .pipe(gulpif('*.css', $.cssnano()))
    .pipe(gulpif('*.css', $.size({ title: 'styles (after) ' })))
    .pipe(gulpif('*.css', $.autoprefixer()))
    .pipe(gulpif('*.js', $.babel()))
    .pipe(gulpif('*.js', $.size({title: 'scripts (before)'})))
    .pipe(gulpif('*.js', $.uglifyEs.default()))
    .pipe(gulpif('*.js', $.size({title: 'scripts (after) '})))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulpif('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      minifyJS: {compress: {drop_console: true}},
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))

    .pipe(gulpif('*.html', $.size({ title: 'html (after) ', showFiles: false })))
    .pipe(gulp.dest('dist'));
});

// Process Service Worker
gulp.task('sw', function () {
  var bundler = browserify('./app/ServiceWorker.js', {debug: true}); // ['1.js', '2.js']

  return bundler
    .transform(babelify, {sourceMaps: true})  // required for 'import'
    .bundle()               // concat
    .pipe(source('ServiceWorker.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugins
    .pipe(gulp.dest('.tmp'));
});

// Optimize Service Worker
gulp.task('sw:dist', function () {
  var bundler = browserify('./app/ServiceWorker.js', {debug: true}); // ['1.js', '2.js']

  return bundler
    .transform(babelify, {sourceMaps: true})  // required for 'import'
    .bundle()               // concat
    .pipe(source('ServiceWorker.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugins
    .pipe($.size({ title: 'Service Worker (before)' }))
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.uglifyEs.default())         // minify
    .pipe($.size({title: 'Service Worker (after) '}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

// Clean temp directory
gulp.task('clean', function () {
  return del(['.tmp/**/*']); // del files rather than dirs to avoid error
});

// Clean output directory
gulp.task('clean:dist', function () {
  return del(['dist/**/*']); // del files rather than dirs to avoid error
});

// Watch files for changes & reload
gulp.task('serve', function () {
  runSequence(['clean'], ['images', 'lint', 'html', 'sw'], function() {
    browserSync.init({
      server: '.tmp',
      port: 8001
    });

    gulp.watch(['app/*.html'], ['html', reload]);
    gulp.watch(['app/css/*.css'], ['html', reload]);
    gulp.watch(['app/js/*.js'], ['lint', 'html', reload]);
    gulp.watch(['app/ServiceWorker.js'], ['lint', 'sw', reload]);
  });
});

// Build and serve the fully optimized site
gulp.task('serve:dist', ['default'], function () {
  browserSync.init({
    server: 'dist',
    port: 8000
  });

  gulp.watch(['app/*.html'], ['html:dist', reload]);
  gulp.watch(['app/css/*.css'], ['html:dist', reload]);
  gulp.watch(['app/js/*.js'], ['lint', 'html:dist', reload]);
  gulp.watch(['app/ServiceWorker.js'], ['lint', 'sw', reload]);
});

// Build production files, the default task
gulp.task('default', ['clean:dist'], function (done) {
  runSequence([ 'lint', 'html:dist', 'sw:dist'], done);
});