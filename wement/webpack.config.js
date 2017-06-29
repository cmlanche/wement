var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'wement.js',
    path: path.resolve(__dirname, 'dist')
  }
};
