import fs from 'fs';
import path from 'path';

const CLASS_MAP_FILE = path.resolve(process.cwd(), 'nameMap.json');

// ✅ Function to generate random class names
const generateRandomClassName = (originalName) => {
  return 'cls_' + Buffer.from(originalName).toString('base64').slice(0, 6);
};

// ✅ Load existing class mappings OR generate new ones
export const getClassMapping = () => {
  if (fs.existsSync(CLASS_MAP_FILE)) {
    return JSON.parse(fs.readFileSync(CLASS_MAP_FILE, 'utf8'));
  }
  return {};
};

// ✅ Main function to rename classes
export const updateClassMapping = (classNames) => {
  let classMap = getClassMapping();

  classNames.forEach((className) => {
    if (!classMap[className]) {
      classMap[className] = generateRandomClassName(className);
    }
  });

  fs.writeFileSync(CLASS_MAP_FILE, JSON.stringify(classMap, null, 2));
  return classMap;
};
