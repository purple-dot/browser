const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "built-script.ts"),
  output: {
    filename: "output.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Match TypeScript files
        use: "ts-loader", // Use ts-loader for TypeScript files
        exclude: /node_modules/, // Exclude node_modules from being processed by the loader
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"], // Add '.ts' and '.js' to the list of extensions Webpack should resolve
  },
  plugins: [new HtmlWebpackPlugin()],
  devtool: "source-map",
};
