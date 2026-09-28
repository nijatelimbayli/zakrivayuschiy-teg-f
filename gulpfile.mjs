import gulp from 'gulp';
import browserSync from 'browser-sync';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
import autoPrefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import fileinclude from 'gulp-file-include';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import { deleteAsync } from 'del';
import newer from 'gulp-newer';
import sharp from 'sharp';
import { Transform } from 'node:stream';
import svgstore from 'gulp-svgstore';
import svgmin from 'gulp-svgmin';
import rename from 'gulp-rename';
import tt2woff from 'gulp-ttf2woff';
import tt2woff2 from 'gulp-ttf2woff2';

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

  styles: {
    src: './src/styles/style.scss',
    watch: './src/styles/**/*.scss',
    dest: './app/styles',
  },

  scripts: {
    src: './src/scripts/**/*.js',
    watch: './src/scripts/**/*.js',
    dest: './app/scripts',
  },

  images: {
    src: ['./src/images/**/*.{jpg,jpeg,png,gif,svg,webp,avif}'],
    watch: './src/images/**/*.{jpg,jpeg,png,gif,svg,webp,avif}',
    dest: './app/images',
  },

  favicons: {
    src: ['./src/favicons/**/*.{jpg,jpeg,png,gif,svg,webp,avif,ico,webmanifest}'],
    watch: './src/favicons/**/*.{jpg,jpeg,png,gif,svg,webp,avif,ico,webmanifest}',
    dest: './app/favicons',
  },

  svg: {
    src: ['./src/svg/**/*.svg'],
    dest: './app/svg',
  },

  webp: {
    src: './src/images/**/*.{jpg,jpeg,png}',
    dest: './app/images',
  },

  avif: {
    src: './src/images/**/*.{jpg,jpeg,png}',
    dest: './app/images',
  },

  sprite: {
    src: './src/svg/**/*.svg',
    watch: './src/svg/**/*.svg',
    dest: './app/svg/',
  },

  fonts: {
    ttf: './src/fonts/**/*.{ttf}',
    woff: './src/fonts/**/*.{woff,woff2}',
    watch: './src/fonts/**/*.{ttf,woff,woff2}',
    dest: './app/fonts/',
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

export const styles = () => {
  return src(paths.styles.src, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoPrefixer({
        cascade: true,
      })
    )
    .pipe(cleanCss())
    .pipe(rename('style.min.css'))
    .pipe(dest(paths.styles.dest, { sourcemaps: '.' }))
    .pipe(server.stream());
};

export const scripts = () => {
  return src(paths.scripts.src, { sourcemaps: true })
    .pipe(concat('main.min.js'))
    .pipe(terser())
    .pipe(dest(paths.scripts.dest, { sourcemaps: '.' }))
    .pipe(server.stream());
};

const eachFile = (fn) =>
  new Transform({
    objectMode: true,
    transform(file, encoding, done) {
      fn(file).then((result) => done(null, result), done);
    },
  });

const optimizeImages = () =>
  eachFile(async (file) => {
    const ext = file.extname.toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg') {
      file.contents = await sharp(file.contents).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
    }

    if (ext === '.png') {
      file.contents = await sharp(file.contents)
        .png({ quality: 80, compressionLevel: 9 })
        .toBuffer();
    }

    return file;
  });

export const convertTo = (format, options) =>
  eachFile(async (file) => {
    file.contents = await sharp(file.contents).toFormat(format, options).toBuffer();
    file.extname = `.${format}`;
    return file;
  });

export const images = () => {
  return src(paths.images.src, { encoding: false })
    .pipe(newer(paths.images.dest))
    .pipe(optimizeImages())
    .pipe(dest(paths.images.dest));
};

export const favicons = () => {
  return src(paths.favicons.src, { encoding: false })
    .pipe(newer(paths.favicons.dest))
    .pipe(dest(paths.favicons.dest));
};

export const svgImages = () => {
  return src(paths.svg.src)
    .pipe(newer(paths.svg.dest))
    .pipe(
      svgmin({
        plugins: [
          'preset-default',
          {
            name: 'removeViewBox',
            active: false,
          },
        ],
      })
    )
    .pipe(dest(paths.svg.dest));
};

export const createWebp = () => {
  return src(paths.webp.src, { encoding: false })
    .pipe(newer({ dest: paths.webp.dest, ext: '.webp' }))
    .pipe(convertTo('webp', { quality: 80 }))
    .pipe(dest(paths.webp.dest));
};

export const createAvif = () => {
  return src(paths.avif.src, { encoding: false })
    .pipe(newer({ dest: paths.avif.dest, ext: '.avif' }))
    .pipe(convertTo('avif', { quality: 60 }))
    .pipe(dest(paths.avif.dest));
};

export const sprite = () => {
  return src(paths.sprite.src)
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(rename('sprite.svg'))
    .pipe(dest(paths.sprite.dest));
};

export const fontsWoff = () => {
  return src(paths.fonts.ttf, { encoding: false })
    .pipe(newer({ dest: paths.fonts.dest, ext: '.woff' }))
    .pipe(tt2woff())
    .pipe(dest(paths.fonts.dest));
};

export const fontsWoff2 = () => {
  return src(paths.fonts.ttf, { encoding: false })
    .pipe(newer({ dest: paths.fonts.dest, ext: '.woff2' }))
    .pipe(tt2woff2())
    .pipe(dest(paths.fonts.dest));
};

export const fontsCopy = () => {
  return src(paths.fonts.woff, { encoding: false })
    .pipe(newer({ dest: paths.fonts.dest }))
    .pipe(dest(paths.fonts.dest));
};

const reload = (done) => {
  server.reload();
  done();
};

export const img = series(images, favicons, createWebp, createAvif);
export const fonts = series(fontsWoff, fontsWoff2, fontsCopy);

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
  watch(paths.styles.watch, styles);
  watch(paths.scripts.watch, scripts);
  watch(paths.images.watch, series(img, reload));
  watch(paths.favicons.watch, series(img, reload));
  watch(paths.sprite.watch, series(sprite, reload));
  watch(paths.fonts.watch, series(fonts, reload));
};

export default series(
  clear,
  parallel(html, styles, scripts, img, sprite, fonts),
  parallel(serve, watcher)
);

export const build = series(clear, parallel(html, styles, scripts, img, sprite, fonts));
