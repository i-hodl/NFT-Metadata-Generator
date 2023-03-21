const path = require('path');

module.exports = {
  // entry, output, module, and plugins configurations...

  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
    },
  },
  module: {
    noParse: /dag-jose/,
    rules: [
      // rules configurations...
    ],
  },
};
