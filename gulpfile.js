var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var autoprefixer= require('gulp-autoprefixer');
var cp          = require('child_process');
var runSequence = require('run-sequence');
var size        = require('gulp-size');
var bytediff    = require('gulp-bytediff');
var del         = require('del');
var minifyCSS   = require('gulp-cssnano');
var uglify      = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');
var rename      = require('gulp-rename');


var paths = {
    src: 'src',
    dev: 'dev',
    prod: 'prod',

    scss: '/assets/sass',
    css: '/assets/css',
    js: '/assets/js'
}
var is_prod = false;

// compile tasks
gulp.task('jekyll-build', (cb) => {
    browserSync.notify('Compiling Jekyll');
    var dest = is_prod ? paths.prod : paths.dev;
    return cp.spawn(
        'jekyll', [
            'build'
        ],
        { stdio: 'inherit' }
    )
  .on('close', cb);
});

gulp.task('jekyll-rebuild', ['jekyll-build'], () => {
    browserSync.reload();
});

gulp.task('reload', () => {
    browserSync.reload();
});

gulp.task('scss', () => {
    var dest = is_prod ? paths.prod : paths.dev;
    return gulp.src(paths.src + paths.scss + '/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            indentedSyntax: true
        }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('.'))
        .pipe(size({showFiles: true}))
        .pipe(gulp.dest(dest + paths.css))
        .pipe(gulp.dest(paths.src + paths.css));
});
gulp.task('minify-css', () => {
    var dest = is_prod ? paths.prod : paths.dev;
    console.log(dest + paths.css + '/app.css');
    return gulp.src(dest + paths.css + '/app.css')
        .pipe(rename({suffix: '.min'}))
        .pipe(bytediff.start())
        .pipe(minifyCSS())
        .pipe(bytediff.stop())
        .pipe(size({showFiles: true}))
        .pipe(gulp.dest(dest + paths.css))
        .pipe(gulp.dest(paths.src + paths.css))
        .pipe(browserSync.stream({ match: '**/*.css' }));
});

gulp.task('watch', () => {
    is_prod = false;
    gulp.watch(paths.src + paths.scss + '/**/*.scss', () => {
        runSequence(
            'scss',
            'reload'
        );
    });
    gulp.watch([
        paths.src + '/**/*.html',
        paths.src + '/**/*.markdown'
    ], ['jekyll-rebuild']);
});

// server & reload
gulp.task('browser-sync', ['scss', 'minify-css', 'jekyll-build'], () => {
    var base = is_prod ? paths.prod : paths.dev;
    browserSync.init({
        server: {
            baseDir: base
        }
    });
});

// dev build
gulp.task('devbuild', ['browser-sync', 'watch']);

// production build & server
gulp.task('prodbuild', () => {
    is_prod = true;
    runSequence(
        'scss',
        'minify-css',
        'jekyll-build'
    );
});
gulp.task('server', () => {
    is_prod = true;
    runSequence(
        'browser-sync'
    );
});

// tasks
gulp.task('default', ['devbuild']);
gulp.task('build', ['prodbuild']);

// clear generated folders
gulp.task('cleandev', function() {
    return del([paths.dev]);
});
gulp.task('cleanprod', function() {
    return del([paths.prod]);
});
gulp.task('clean', ['cleandev', 'cleanprod']);
