import del from 'del';
import gulp from 'gulp';
import browserSync from 'browser-sync';
import GulpCleanCss from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import imagemin from 'gulp-imagemin';
import htmlmin from 'gulp-htmlmin';
import size from 'gulp-size';
import autoPrefixer from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import gulpCopy from 'gulp-copy';
//import SASS compilleer
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

//Newer
import newer from 'gulp-newer';

browserSync.create();

// PATH's

const paths = {
	html: {
		src: 'src/*.html',
		dest: 'dist/',
	},
	styles: {
		src: ['src/styles/*.scss', 'src/styles/*.css'],
		dest: 'dist/css',
	},
	scripts: {
		src: 'src/scrits/*.js',
		dest: 'dist/js'
	},
	images: {
		src: 'src/images/**/*',
		dest: 'dist/images',
	},
	fonts: {
		src: 'src/fonts/**/*',
		dest: 'dist/fonts/'
	}
}

// Clean destination directory
function clean() {
	return del(['dist/*', '!dist/images', '!fonts/']);
}

// Styles preprocessors
function styles() {
	return gulp.src(paths.styles.src)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoPrefixer({
			cascade: false
		}))
		.pipe(GulpCleanCss({
			level: 2,
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(size())
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
}

// Image minification
function img() {
	return gulp.src(paths.images.src)
		.pipe(newer(paths.images.dest))
		.pipe(imagemin({
			progressive: true
		}))
		.pipe(size({
			showFiles: true
		}))
		.pipe(gulp.dest(paths.images.dest))
		.pipe(browserSync.stream());
}

function html() {
	return gulp.src('src/*.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(size())
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.stream());
}

function watch() {
	browserSync.init({
		server: {
			baseDir: 'dist/'
		},
		online: true,
		tunnel: true,
		logLevel: 'debug'
	});
	gulp.watch(paths.html.src).on('change', browserSync.reload);
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.html.src, html);
	gulp.watch(paths.images.src, img);
	gulp.watch(paths.fonts.src, fonts);
}

function fonts() {
	return gulp.src(paths.fonts.src)
		.pipe(newer(paths.images.dest))
		.pipe(gulpCopy(paths.fonts.dest, { prefix: 2 }))
		.pipe(gulp.dest(paths.fonts.dest))
}

const build = gulp.series(clean, html, gulp.parallel(fonts, styles, img), watch);

export { clean, styles, watch, build, img, html };

export default build;
