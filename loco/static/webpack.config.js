var webpack = require('webpack');
module.exports = {
  entry: {
    Home : './static/js/home.js',
  },
  output: {
    path: __dirname + '/js/build',
    publicPath: '/',
    filename: '[name].js'
  },
  devtool: "eval",
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets : ['es2015', 'stage-2', 'react']
      }
    }]
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './public'
  }
};