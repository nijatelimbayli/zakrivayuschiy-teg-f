import gulp from 'gulp';
import browserSync from 'browser-sync';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import autoPrefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import fileinclude from 'gulp-file-include';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import { deleteAsync } from 'del';
import newer from 'gulp-newer';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import avif from 'gulp-avif';
import svgsoter from 'gulp-svgstore';
import svgmin from 'gulp-svgmin';
import rename from 'gulp-rename';

const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);
const server = browserSync.create();

const paths = {
  app: './app',

  html: {
    src: './src/html/*.html',
    watch: './src/html/**/*.html',
    dest: './app',
  },
};

export const clear = () => deleteAsync([paths.app]);

export const html = () => {
  return src(paths.html.src)
    .pipe(
      fileinclude({
        prefix: '@',
        basepath: '@file',
      })
    )
    .pipe(dest(paths.html.dest))
    .pipe(server.stream());
};

export const serve = () => {
  server.init({
    server: {
      baseDir: paths.app,
    },
    notify: false,
    open: true,
  });
};

export const watcher = () => {
  watch(paths.html.watch, html);
};

export default series(clear, parallel(html), parallel(serve, watcher));

export const build = series(clear, parallel(html));
