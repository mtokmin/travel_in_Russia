const { src, dest, watch, series } = require('gulp');

const scss = require('gulp-sass')(require('sass')); //Поддержка Scss
const concat = require('gulp-concat'); //Объединение в 1 файл
const uglify = require('gulp-uglify-es').default; //Минификация JS
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer'); //Плагин для кэширования
const svgSprite = require('gulp-svg-sprite'); //Объединяем все svg в 1 спрайт
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const gulpPug = require('gulp-pug');


const pug = ()=> {
  return src('app/pages/*.pug')
  .pipe(gulpPug({pretty: false}))
  .pipe(dest('app'))
}

const fonts = ()=> {
  return src('app/fonts/src/*.*')
    .pipe(fonter({
      formats: ['woff', 'ttf']
    }))
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts'))
}

const images = () => {
  return src(['app/images/src/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images/dist'))
    .pipe(avif({ quality: 50 }))
    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images/dist'))
    .pipe(webp())
    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images/dist'))
    .pipe(imagemin())
    .pipe(dest('app/images/dist'));
};

const sprite = ()=> {
  return src('app/images/dist/*.svg')
  .pipe(svgSprite({
    mode: {
      stack: {
        sprite: '../sprite.svg',
        example: true
      }
    }
}))
  .pipe(dest('app/images/dist/'))
}

const scripts = () => {
  return src(['app/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
};

const styles = () => {
  return src(['app/scss/style.scss'])
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
};

const watching = () => {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
  });
  watch(['app/scss/**/*.scss', 'app/scss/style.scss'], styles);
  watch(['app/images/src'], images);
  watch(['app/pages'], pug);
  watch(['app/js/**/*.js', 'app/js/main.js', '!app/js/main.min.js'], scripts);
  watch(['app/*.html']).on('change', browserSync.reload);
};

const cleanDocs = () => {
  return src('docs').pipe(clean());
};

const building = () => {
  return src(['app/css/*.css', 'app/images/dist/*.*', 'app/images/dist/*/*.*', 'app/fonts/*.*', 'app/js/main.min.js', 'app/*.html'], {
    base: 'app',
  }).pipe(dest('docs'));
};

exports.fonts = fonts;

exports.build = series(cleanDocs, building);
exports.default = series(styles, images, scripts, watching);
