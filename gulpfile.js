const { series, src, dest, watch } = require('gulp');
const sourcemaps  = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const size = require('gulp-size');
const rename = require('gulp-rename');
const bytediff = require('gulp-bytediff');
const minifyCSS = require('gulp-cssnano');
const del = require('del');
const browserSync = require('browser-sync');
const execa = require('execa');
var is_prod = false;

const paths = {
    src: 'src',
    dev: 'dev',
    prod: 'prod',

    scss: '/assets/sass',
    css: '/assets/css',
    js: '/assets/js'
}

function reload(done) {
    browserSync.reload();
    done();
}

async function jekyllBuild() {
    browserSync.notify('Compiling Jekyll');
    const pathdest = is_prod ? paths.prod : paths.dev;
    return await execa('bundle', [
            'exec',
            'jekyll',
            'build',
            '--source=' + paths.src,
            '--destination=' + pathdest,
            '--config=_config.yml'
        ],
        { stdio: 'inherit' }
    )
}

const jekyllRebuild = series(jekyllBuild, reload);

function scssCompile() {
    const pathdest = is_prod ? paths.prod : paths.dev;
    return src(paths.src + paths.scss + '/**/*.scss')
        .pipe(sourcemaps.init())
            .pipe(sass({
                indentedSyntax: true
            }).on('error', sass.logError))
            .pipe(autoprefixer())
        .pipe(sourcemaps.write('.'))
        .pipe(size({showFiles: true}))
        .pipe(dest(pathdest + paths.css))
        .pipe(dest(paths.src + paths.css));
}

function cssminify() {
    const pathdest = is_prod ? paths.prod : paths.dev;
    console.log(pathdest + paths.css + '/app.css');
    return src(pathdest + paths.css + '/app.css')
        .pipe(rename({suffix: '.min'}))
        .pipe(bytediff.start())
        .pipe(minifyCSS())
        .pipe(bytediff.stop())
        .pipe(size({showFiles: true}))
        .pipe(dest(pathdest + paths.css))
        .pipe(dest(paths.src + paths.css))
        .pipe(browserSync.stream({ match: '**/*.css' }));
}

function watchTask() {
    is_prod = false;
    watch(paths.src + paths.scss + '/**/*.scss', series(scssCompile, reload))
    watch([
        paths.src + '/**/*.html',
        paths.src + '/**/*.marddown'
    ], jekyllRebuild);
}

function browserSyncInit () {
    const base = is_prod ? paths.prod : paths.dev;
    browserSync.init({
        server: {
            baseDir: base
        }
    })
}

const browserSyncStart = series(scssCompile, cssminify, jekyllBuild, browserSyncInit);
const devbuild = series(browserSyncStart, watchTask);

function makeProd (done) {
    is_prod = true;
    done();
}
const prodbuild = series(makeProd, scssCompile, cssminify, jekyllBuild);

async function cleanprod() {
    return del([paths.dev]);
}

async function cleandev() {
    return del([paths.prod]);
}

exports.build = series(cleanprod, prodbuild);
exports.server = series(makeProd, browserSyncStart)
exports.cleanprod = cleanprod;
exports.cleandev = cleandev;
exports.clean = series(cleandev, cleanprod);
exports.default = series(cleandev, devbuild);
