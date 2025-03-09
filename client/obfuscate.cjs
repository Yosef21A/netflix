const fs = require('fs');
const path = require('path');
const glob = require('glob');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Load obfuscation config
const obfuscatorConfig = JSON.parse(fs.readFileSync('obfuscator.config.json', 'utf-8'));

// Define build directory
const buildDir = path.join(__dirname, 'build');

// Get all JS files inside the build directory
const jsFiles = glob.sync(`${buildDir}/**/*.js`);

console.log(`🔍 Found ${jsFiles.length} JavaScript files to obfuscate...`);

jsFiles.forEach((file) => {
  try {
    const scriptContent = fs.readFileSync(file, 'utf-8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(scriptContent, obfuscatorConfig);
    fs.writeFileSync(file, obfuscationResult.getObfuscatedCode(), 'utf-8');
    console.log(`✅ Obfuscated: ${file}`);
  } catch (err) {
    console.error(`❌ Failed to obfuscate ${file}:`, err);
  }
});

console.log('🎉 Obfuscation complete!');
