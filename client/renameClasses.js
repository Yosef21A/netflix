import fs from 'fs';
import path from 'path';
import * as glob from 'glob';
import { getClassMapping, updateClassMapping } from './class_mapping.js';

// ✅ Define Directories
const COMPONENTS_DIR = path.join(process.cwd(), 'src/components'); // ✅ All components
const STYLES_DIRS = [
  path.join(process.cwd(), 'src/assets/styles'), // ✅ Global styles
  path.join(process.cwd(), 'src/components') // ✅ Per-component styles
];

// ✅ Find all class names in styles
const getAllClassNames = () => {
  let classNames = new Set();

  STYLES_DIRS.forEach((dir) => {
    const cssFiles = glob.sync(`${dir}/**/*.{css,scss,less}`);

    cssFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/\.(\w[\w-]*)/g);
      if (matches) {
        matches.forEach((m) => classNames.add(m.replace('.', '')));
      }
    });
  });

  return Array.from(classNames);
};

// ✅ Replace class names in component files
const replaceClassNamesInFiles = (classMap) => {
  const componentFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{js,jsx,tsx}`);
  const styleFiles = glob.sync(`${STYLES_DIRS.join(',')}/**/*.{css,scss,less}`);

  componentFiles.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');

    Object.entries(classMap).forEach(([oldClass, newClass]) => {
      const regex = new RegExp(`className=["'\`]([^"\`']*\\b${oldClass}\\b[^"\`']*)["'\`]`, 'g');
      content = content.replace(regex, (match, p1) => {
        return `className="${p1.replace(oldClass, newClass)}"`;
      });
    });

    fs.writeFileSync(file, content, 'utf8');
  });

  // ✅ Rename class names in CSS files
  styleFiles.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');

    Object.entries(classMap).forEach(([oldClass, newClass]) => {
      const regex = new RegExp(`\\.${oldClass}\\b`, 'g'); // Match `.classname`
      content = content.replace(regex, `.${newClass}`);
    });

    fs.writeFileSync(file, content, 'utf8');
  });
};

// ✅ Main Execution
const renameClasses = async () => {
  console.log("🔍 Scanning for class names...");
  const classNames = getAllClassNames();
  console.log(`📌 Found ${classNames.length} class names.`);

  console.log("⚙️ Updating class mapping...");
  const classMap = updateClassMapping(classNames);

  console.log("📝 Replacing class names in components and styles...");
  replaceClassNamesInFiles(classMap);

  console.log('✅ Class renaming completed!');
};

renameClasses();
