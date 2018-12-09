var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var fs = require('fs');
var del = require('del');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var runSequence = require('run-sequence');
var lazypipe = require('lazypipe');
var browserSync = require('browser-sync').create();


var $ = gulpLoadPlugins();
var reload = browserSync.reload;
var useref = require('gulp-useref');
var stringReplace = require('gulp-replace');

// Copy fixed images
gulp.task('fixed-images', function () {
  return gulp.src('app/img/fixed/**')
    .pipe(gulp.dest('.tmp/img/fixed'))
    .pipe(gulp.dest('dist/img/fixed'));
});

// Styles
gulp.task('styles', function () {
  return gulp.src('app/css/*.css')
    .pipe($.if('*.css', $.autoprefixer()))
    .pipe(gulp.dest('.tmp/css/'))
.pipe(gulp.dest('dist/css/'))
});

// Copy manifest
gulp.task('manifest', function () {
  return gulp.src('app/manifest.json')
    .pipe(gulp.dest('.tmp/'))
    .pipe(gulp.dest('dist/'));
});

// Prep assets for dev
gulp.task('html', function () {
  
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe($.if('*.css', $.autoprefixer()))
    .pipe($.if('*.js', $.babel()))
    .pipe($.if('*.html', $.htmlmin({
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
  // var apiKey = fs.readFileSync('GM_API_KEY', 'utf8');
  var GM_API_KEY = process.env.GM_API_KEY;
  
  return gulp.src('app/*.html')
    .pipe($.size({title: 'html (before)'}))
    .pipe(useref({},
      lazypipe().pipe($.sourcemaps.init)
      // lazypipe().pipe(babel) // no coz css
      // transforms assets before concat
    ))
    .pipe($.if('*.css', $.size({ title: 'styles (before)' })))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.css', $.size({ title: 'styles (after) ' })))
    .pipe($.if('*.css', $.autoprefixer()))
    .pipe($.if('*.js', $.babel()))
    .pipe($.if('*.js', $.size({title: 'scripts (before)'})))
    .pipe($.if('*.js', $.uglifyEs.default()))
    .pipe($.if('*.js', $.size({title: 'scripts (after) '})))
    .pipe($.sourcemaps.write('.'))
    .pipe($.if('*.html', $.htmlmin({
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

    .pipe($.if('*.html', $.size({ title: 'html (after) ', showFiles: false })))
    .pipe(gulp.dest('dist'));
});

// Service Worker
gulp.task('sw', function () {
  var bundler = browserify([
    './app/js/idbhelper.js',
    './app/ServiceWorker.js'
  ], { debug: false }); // ['1.js', '2.js']

  return bundler
    .transform(babelify, {sourceMaps: false})  // required for 'import'
    .bundle()               // concat
    .pipe(source('ServiceWorker.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugins
    .pipe(gulp.dest('.tmp'));
});

// DBHelper
gulp.task('dbhelper', function () {
  var bundler = browserify([
    './app/js/idbhelper.js',
    './app/js/dbhelper.js'
  ], { debug: false }); // ['1.js', '2.js']

  return bundler   
    .transform(babelify, {sourceMaps: false})  // required for 'import'
    .bundle()               // concat
    .pipe(source('dbhelper.min.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugins
    .pipe(gulp.dest('.tmp/js/'));
});

// Index Scripts
gulp.task('scripts1', function () {
  var bundler = browserify([
    './app/js/dbhelper.js',
    './app/js/idbhelper.js',
    './app/js/registerServiceWorker.js',
    './app/js/main.js'
  ], { debug: false, insertGlobals: true }); // ['1.js', '2.js']

  return bundler
    .transform(babelify, {sourceMaps: false})  // required for 'import'
    .bundle()               // concat
    .pipe(source('index.min.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugins
    .pipe(gulp.dest('.tmp/js/'));
});

// Restaurant Scripts
gulp.task('scripts2', function () {
  var bundler = browserify([
    './app/js/idbhelper.js',
    './app/js/dbhelper.js',
    './app/js/registerServiceWorker.js',
    './app/js/restaurant_info.js'
  ], { debug: false }); // ['1.js', '2.js']

  return bundler
    .transform(babelify.configure({
    presets: ["es2015"]
  }))  // required for 'import'
    .bundle()               // concat
    .pipe(source('restaurant.min.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugins
    .pipe(gulp.dest('.tmp/js/'));
});

// Optimize Service Worker
gulp.task('sw:dist', function () {
  var bundler = browserify([
    './app/js/idbhelper.js',
    './app/ServiceWorker.js'
  ], {debug: true}); // ['1.js', '2.js']

  return bundler
    .transform("babelify", {presets: ["es2015"]})  // required for 'import'
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

// Optimize DBHelper
gulp.task('dbhelper:dist', function () {
  var bundler = browserify([
    './app/js/idbhelper.js',
    './app/js/dbhelper.js'
  ], {debug: true}); // ['1.js', '2.js']

  return bundler
    .transform(babelify, {sourceMaps: true})  // required for 'import'
    .bundle()               // concat
    .pipe(source('dbhelper.min.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugins
    .pipe($.size({ title: 'DBHelper (before)' }))
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.uglifyEs.default())         // minify
    .pipe($.size({title: 'DBHelper (after) '}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/js/'));
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
  runSequence(['clean'], ['html', 'sw', 'dbhelper', 'manifest'], function() {
    browserSync.init({
      server: 'app',
      port: 8001
    });

    gulp.watch(['app/css/*.css'], ['html', reload]);
    gulp.watch(['app/js/*.js', '!app/js/dbhelper.js', '!app/js/idbhelper.js'], ['lint', 'html', reload]);
    gulp.watch(['app/sw.js', 'app/js/idbhelper.js'], ['lint', 'sw', reload]);
    gulp.watch(['app/js/dbhelper.js', 'app/js/idbhelper.js'], ['lint', 'dbhelper', reload]);
    gulp.watch(['app/manifest.json'], ['manifest', reload]);
  });
});

// Build dev files
gulp.task('build', function (done) {
  runSequence(['html', 'sw', 'dbhelper', 'manifest'], done);
});

// Build and serve the fully optimized site
gulp.task('serve:dist', ['default'], function () {
  browserSync.init({
    server: 'app',
    port: 8000
  });

  gulp.watch(['app/css/*.css'], ['html:dist', 'inline1', 'inline2', reload]);
  gulp.watch(['app/js/*.js', '!app/js/dbhelper.js', '!app/js/idbhelper.js'], ['lint', 'html:dist', 'inline1', 'inline2', reload]);
  gulp.watch(['app/ServiceWorker.js', 'app/js/idbhelper.js'], ['lint', 'sw:dist', reload]);
  gulp.watch(['app/js/dbhelper.js', 'app/js/idbhelper.js'], ['lint', 'dbhelper:dist', 'html:dist', 'inline1', 'inline2', reload]);
  gulp.watch(['app/manifest.json'], ['manifest', reload]);
});

// Build production files, the default task
gulp.task('default', ['clean:dist'], function (done) {
  runSequence([ 'html:dist', 'sw:dist','styles', 'scripts1','scripts2','dbhelper:dist', 'manifest'], ['inline1', 'inline2'], done);
});

// index.html
gulp.task('inline1', function () {
  return gulp
    .src('./dist/index.html')
    .pipe(
      stringReplace('<link rel=stylesheet href=css/styles.css>', function(s) {
        var style = fs.readFileSync("dist/css/styles.css", "utf8");
        return "<style>" + style + "</style>";
      })
    )
    .pipe(
      stringReplace('<script src=js/dbhelper.min.js></script>', function(s) {
        var script = fs.readFileSync('dist/js/dbhelper.min.js', 'utf8');
        return '<script>' + script + '</script>';
      })
    )
    .pipe(
      stringReplace('<script src=js/index.min.js defer></script>', function(s) {
        var script = fs.readFileSync('dist/js/index.min.js', 'utf8');
        return '<script>' + script + '</script>';
      })
    )
    // .pipe(minify())
    .pipe(gulp.dest("dist/"));
});

// restaurant.html
gulp.task('inline2', function () {
  return gulp
    .src('./dist/restaurant.html')
    .pipe(
      stringReplace('<link rel=stylesheet href=css/styles.css>', function(s) {
        var style = fs.readFileSync("dist/css/styles.css", "utf8");
        return "<style>" + style + "</style>";
      })
    )
    .pipe(
      stringReplace('<script src=js/dbhelper.min.js></script>', function(s) {
        var script = fs.readFileSync('dist/js/dbhelper.min.js', 'utf8');
        return '<script>' + script + '</script>';
      })
    )
    .pipe(
      stringReplace('<script src=js/restaurant.min.js defer></script>', function(s) {
        var script = fs.readFileSync('dist/js/restaurant.min.js', 'utf8');
        return '<script>' + script + '</script>';
      })
    )
    // .pipe(minify())
    .pipe(gulp.dest("dist/"));
});
