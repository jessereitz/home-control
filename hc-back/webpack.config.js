const path = require('path');
const nodeExternals = require('webpack-node-externals');


module.exports = {
  entry: {
    app: ['./index.js'],
  },
  target: 'node',
  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: 'server.js',
  },
  externals: [nodeExternals()],
};
