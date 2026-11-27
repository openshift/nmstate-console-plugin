// CJS identity for CSS/SCSS imports. PatternFly's CommonJS builds `require()` stylesheets;
// mapping those to an ESM `.ts` mock creates a require(esm) cycle under Jest's ESM runtime.
module.exports = {};
