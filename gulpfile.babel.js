import gulp from 'gulp';
import babel from 'gulp-babel';
import bower from 'gulp-bower';
import browserSync from 'browser-sync';
import nodemon from 'gulp-nodemon';
import sass from 'gulp-sass';
import eslint from 'gulp-eslint';
import mocha from 'gulp-mocha';
import exit from 'gulp-exit';


// generate bower components
gulp.task('bower', () => {
  bower().pipe(gulp.dest('./bower_components'));
});

// compile ES6 codes to ES5 codes with gulp-babel
gulp.task('babel-compile', () => {
  gulp.src(['./**/*.js', '!dist/**', '!node_modules/**', '!gulpfile.babel.js', '!bower_components/**/*']) // ES2015 codes
    .pipe(babel())
    .pipe(gulp.dest('./dist')); // write them
});

gulp.task('nodemon', () => {
  nodemon({
    script: './dist/server.js', // run ES5 code
    ext: 'js html jade json scss css',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['app', 'config', 'public', 'server.js'], // watch ES2015 code
    env: {
      PORT: 3000,
      NODE_ENV: 'development'
    },
    tasks: ['recompile'] // compile synchronously onChange
  });
});

// watch files in public and app directories for changes
gulp.task('watch', () => {
  gulp.watch('app/views/**', browserSync.reload());
  gulp.watch('public/js/**', browserSync.reload());
  gulp.watch('app/**/*.js', browserSync.reload());
  gulp.watch('public/views/**', browserSync.reload());
  gulp.watch('public/css/common.scss', ['sass']);
  gulp.watch('public/css/**', browserSync.reload());
});

// compile scss to css
gulp.task('sass', () => {
  gulp.src('public/css/common.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css/'));
});

//  provide linting for files
gulp.task('lint', () => {
  gulp.src(['gulpfile.babel.js',
      'public/js/**/*.js',
      'test/**/*.js',
      'app/**/*.js',
      'config/**/*.js'
    ])
    .pipe(eslint());
});

// Transfer other folders and files(excluding js folder) in public to dest/public
gulp.task('transfer-public', () => {
  gulp.src(['public/**/*', '!public/js/**'])
    .pipe(gulp.dest('./dist/public'));
});

// transfer bower packages(dependencies) for angularjs library
gulp.task('angular', () => {
  gulp.src('bower_components/angular/**/*.js')
    .pipe(gulp.dest('./dist/public/lib/angular'));
});

// transfer bower packages(dependencies) for bootstrap library
gulp.task('bootstrap', () => {
  gulp.src('bower_components/bootstrap/**/*')
    .pipe(gulp.dest('./dist/public/lib/bootstrap'));
});

// transfer bower packages(dependencies) for jquery library
gulp.task('jquery', () => {
  gulp.src('bower_components/jquery/**/*')
    .pipe(gulp.dest('./dist/public/lib/jquery'));
});

// transfer bower packages(dependencies) for underscore library
gulp.task('underscore', () => {
  gulp.src('bower_components/underscore/**/*')
    .pipe(gulp.dest('./dist/public/lib/underscore'));
});

// transfer bower packages(dependencies) for angular UI utility library
gulp.task('angularUtils', () => {
  gulp.src('bower_components/angular-ui-utils/modules/route/route.js')
    .pipe(gulp.dest('./dist/public/lib/angular-ui-utils/modules'));
});

// transfer bower packages(dependencies) for angular bootstrap library
gulp.task('angular-bootstrap', () => {
  gulp.src('bower_components/angular-bootstrap/**/*')
    .pipe(gulp.dest('./dist/public/lib/angular-bootstrap'));
});

// transfer bower packages(dependencies) for emojioneArea library
gulp.task('emojione-area', () => {
  gulp.src('bower_components/emojionearea/dist/**/*')
    .pipe(gulp.dest('./dist/public/lib/emojionearea'));
});

// transfer bower packages(dependencies) for intro.js library
gulp.task('intro.js', () => {
  gulp.src('public/intro.js/**/*')
    .pipe(gulp.dest('./dist/public/lib/intro.js'));
});

// Transfer jade files from app/views to dist/app/views
gulp.task('transfer-app-jade', () => {
  gulp.src('app/views/**/*')
    .pipe(gulp.dest('./dist/app/views'));
});

// Transfer config .json files from config/env to dist/config/env
gulp.task('transfer-config-json', () => {
  gulp.src('config/env/*.json')
    .pipe(gulp.dest('./dist/config/env'));
});

gulp.task('transfer-bower', ['angular', 'bootstrap', 'jquery', 'underscore', 'angularUtils', 'angular-bootstrap', 'intro.js', 'emojione-area']);

gulp.task('transfer-to-dist', ['transfer-public', 'transfer-app-jade', 'transfer-config-json']);

gulp.task('test', () => {
  gulp.src('./dist/test/**/*.js')
    .pipe(mocha({
      reporter: 'spec',
      timeout: '500000'
    }))
    .pipe(exit());
});

gulp.task('install', ['bower']);

gulp.task('build', ['sass', 'babel-compile', 'transfer-to-dist', 'transfer-bower']);

gulp.task('recompile', ['sass', 'babel-compile', 'transfer-to-dist']);

gulp.task('default', ['nodemon', 'watch']);
