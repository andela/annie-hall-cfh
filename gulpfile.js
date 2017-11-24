const gulp = require('gulp'),
    bower = require('gulp-bower'),
    browserSync = require('browser-sync'),
    nodemon = require('gulp-nodemon'),
    sass = require('gulp-sass'),
    eslint = require('gulp-eslint'),
    mocha = require('gulp-mocha');


gulp.task('bower', () => {
    bower().pipe(gulp.dest('./bower_components'));
});

gulp.task('nodemon', () => {
    nodemon({
        script: 'server.js',
        ext: 'js',
        ignore: ['README.md', 'node_modules/**', '.DS_Store'],
        watch: ['app', 'config'],
        env: {
            PORT: 3000
        }
    });
});

gulp.task('watch', () => {
    gulp.watch('app/views/**', browserSync.reload());
    gulp.watch('public/js/**', browserSync.reload());
    gulp.watch('app/**/*.js', browserSync.reload());
    gulp.watch('public/views/**', browserSync.reload());
    gulp.watch('public/css/common.scss', ['sass']);
    gulp.watch('public/css/**', browserSync.reload());
});

gulp.task('sass', () => {
    gulp.src('public/css/common/scss')
        .pipe(sass())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('lint', () => {
    gulp.src(['gulpfile.js',
            'public/js/**/*.js',
            'test/**/*.js',
            'app/**/*.js'
        ])
        .pipe(eslint());
});

gulp.task('angular', () => {
    gulp.src('app/bower_components/angular/**/*.js')
        .pipe(gulp.dest('public/lib/angular'));
});

gulp.task('bootstrap', () => {
    gulp.src('bower_components/bootstrap/**/*')
        .pipe(gulp.dest('public/lib/bootstrap'));
});

gulp.task('jquery', () => {
    gulp.src('bower_components/jquery/**/*')
        .pipe(gulp.dest('public/lib/jquery'));
});

gulp.task('underscore', () => {
    gulp.src('bower_components/underscore/**/*')
        .pipe(gulp.dest('public/lib/underscore'));
});

gulp.task('angularUtils', () => {
    gulp.src('bower_components/angular-ui-utils/modules/route/route.js')
        .pipe(gulp.dest('public/lib/angular-ui-utils/modules'));
});

gulp.task('angular-bootstrap', () => {
    gulp.src('bower_components/angular-bootstrap/**/*')
        .pipe(gulp.dest('public/lib/angular-bootstrap'));
});

gulp.task('mochaTest', () => {
    gulp.src(['test/**/*.js'])
        .pipe(mocha({
            reporter: 'spec',
        }));
});

gulp.task('install', ['bower']);

gulp.task('test', ['mochaTest']);

gulp.task('default', ['nodemon', 'watch', 'sass', 'angular', 'bootstrap',
    'jquery', 'underscore', 'angularUtils', 'angular-bootstrap'
]);
