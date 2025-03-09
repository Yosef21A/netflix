const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    purgecss({
      content: ['./src/**/*.{js,jsx,ts,tsx,html}'], // ✅ Scan all JSX, TSX, and HTML files
      css: ['./src/assets/styles/**/*.css'], // ✅ Target all CSS files
      safelist: ['keep-this-class'], // ✅ Prevent these classes from being removed
    }),
  ],
};
