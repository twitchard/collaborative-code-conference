var ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');

const PATHS = {
  app: path.resolve(__dirname, 'src', 'client'),
  build: path.resolve(__dirname, 'build', 'client'),
  node_modules: path.resolve(__dirname, 'node_modules')
};

const config = {
  devtool: 'eval-source-map',
  entry: PATHS.app,
  output: {
    path: PATHS.build,
    filename: 'build.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: [PATHS.node_modules],
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader")
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css")
  ]
}

module.exports = config;
