const path = require('path');

module.exports = {
  mode: "development",
  entry: "./src/scripts/App.ts",
  output: {
    // This tells webpack to automatically add hash to help with caching after every build
    filename: "game.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "dist"
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [
      '.ts', '.js'
    ]
  }
};
