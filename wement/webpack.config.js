var path = require('path');

module.exports = {
    context: path.join(__dirname, 'src'),
  entry: './index.js',
  output: {
    filename: 'wement.js',
    path: path.resolve(__dirname, 'dist')
  },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /^node_mocules/,
                loaders: ['babel-loader'],
            },
        ],
    },
};
