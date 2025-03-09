module.exports = function ({ types: t }) {
  return {
    visitor: {
      JSXOpeningElement(path) {
        // Generate random attribute values
        const randomAttr = `data-aria-random-${Math.random().toString(36).substring(2, 10)}`;
        const hashAttr = `data-aria-hash-${Date.now().toString(36)}`;

        // Inject the attributes
        path.node.attributes.push(
          t.jsxAttribute(t.jsxIdentifier(randomAttr), t.stringLiteral("true")),
          t.jsxAttribute(t.jsxIdentifier(hashAttr), t.stringLiteral("true"))
        );
      }
    }
  };
};
