'use strict';

var
    clip = require('gulp-clip-empty-files'),
    cp = require('child_process'),
    del = require('del'),
    fs = require('fs'),
    gulp = require('gulp'),
    named = require('vinyl-named'),
    pug = require('gulp-pug'),
    path = require('path'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sassTypes = require('node-sass').types,
    webpack = require('webpack-stream'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util')
;

const DEST = './app';
const TEST_URL = 'http://localhost:9876/all';
const IS_DEV = process.env.NODE_ENV === 'dev';

// based on https://coderwall.com/p/fhgu_q/inlining-images-with-gulp-sass
function sassInlineImage(file) {
    var
        filePath = path.resolve(process.cwd(), file.getValue()),
        ext = filePath.split('.').pop(),
        data = fs.readFileSync(filePath),
        buffer = new Buffer(data),
        str = '"data:image/' + ext + ';base64,' + buffer.toString('base64') + '"';
    return sassTypes.String(str);
}

const webpackConfig = {
    devtool: null,
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: __dirname + '/convert-logs?' + (IS_DEV ? 'dev' : '')
            }
        ]
    }
};

gulp.task('js', function () {
    return gulp.src('./src/*.js')
        .pipe(named())
        .pipe(webpack(webpackConfig))
        .pipe(IS_DEV ? util.noop() : uglify())
        .pipe(gulp.dest(DEST))
        ;
});

gulp.task('sass', function () {
    return gulp.src('./src/*.sass')
        .pipe(sass({
            functions: {
                'inline-image($file)': sassInlineImage
            }
        }))
        .pipe(clip())
        .pipe(gulp.dest(DEST))
        ;
});

gulp.task('pug', function () {
    return gulp.src('./src/*.pug')
        .pipe(pug())
        .pipe(gulp.dest(DEST))
        ;
});

gulp.task('copy', function () {
    return gulp.src('./src/*.{png,css,json,svg}')
        .pipe(gulp.dest(DEST))
        ;
});

gulp.task('clean', function () {
    return del.sync(DEST);
});

gulp.task('make', ['clean', 'pug', 'sass', 'copy', 'js']);

// npm run watch 'http://...'
var reloadUrl = process.argv[4] || TEST_URL;

gulp.task('reload', ['make'], function () {
    cp.execSync('osascript -l JavaScript ./reload-chrome.js "' + reloadUrl + '"');
});

gulp.task('watch', ['reload'], function () {
    return gulp.watch('./src/**/*', ['reload']);
});

gulp.task('deploy', ['make'], function () {
    var m = require('./src/manifest.json'),
        fn = 'copytables_' + m.version.replace(/\./g, '_') + '.zip';
    cp.execSync('rm -f ./' + fn + ' && zip -j ./' + fn + ' ./app/*');
});
