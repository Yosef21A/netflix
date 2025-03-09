import gulp from 'gulp';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import through2 from 'through2';
import fs from 'fs';
import postcssClassRename from 'postcss-class-rename';

// Function to generate obfuscated class names
const classMap = {};
const excludedNames = [
  "useState",
  "useEffect",
  "useRef",
  "useContext",
  "useReducer",
  "useCallback",
  "useMemo"
];

const obfuscateClassName = (className) => {
  if (excludedNames.includes(className)) {
    return className; // Don't obfuscate React Hooks
  }
  return 'obf-' + Buffer.from(className).toString('base64').substring(0, 6);
};


// Obfuscate CSS
gulp.task('obfuscate-css', () => {
  return gulp.src('build/static/css/*.css')
    .pipe(postcss([
      postcssClassRename({
        "\\b([a-zA-Z0-9_-]+)\\b": (className) => obfuscateClassName(className),
        "regex": true
      })
    ]))
    .pipe(gulp.dest('build/static/css/'));
});


// Obfuscate JSX
gulp.task('obfuscate-jsx', () => {
  return gulp.src('build/static/js/*.js')
    .pipe(through2.obj(function (file, _, cb) {
      let contents = file.contents.toString();
      Object.keys(classMap).forEach(className => {
        contents = contents.replace(new RegExp(`"${className}"`, 'g'), `"${classMap[className]}"`);
      });
      file.contents = Buffer.from(contents);
      cb(null, file);
    }))
    .pipe(gulp.dest('build/static/js/'));
});

// Combined Task
gulp.task('obfuscate', gulp.series('obfuscate-css', 'obfuscate-jsx'));
