var webpack = require('webpack');
module.exports = {
  entry: {
    Login : './static/js/login.js',
    Dashboard : './static/js/dashboard.js',
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
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({ compress: {
        warnings: false
    }}),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ],
  devServer: {
    historyApiFallback: true,
    contentBase: './public'
  }
};
