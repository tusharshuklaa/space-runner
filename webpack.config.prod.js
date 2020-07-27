const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: "production",
  entry: "./src/scripts/app.ts",
  output: {
    // This tells webpack to automatically add hash to help with caching after every build
    filename: "game.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "none",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [
      '.ts', '.js'
    ]
  },
  plugins: [
    // This clears the dist path on every build
    // new CleanPlugin.CleanWebpackPlugin()
  ]
};
