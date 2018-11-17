const path = require('path');
const nodeExternals = require('webpack-node-externals');


module.exports = {
  entry: {
    app: ['./index.js'],
  },
  target: 'node',
  node: {
    __dirname: false,
  },
  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: 'server.js',
  },
  externals: [nodeExternals()],
};
