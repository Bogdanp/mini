const webpack = require("webpack");

module.exports = {
  entry: __dirname + "/src/app.ts",
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist"
  },

  resolve: {
    extensions: [".ts",".js"]
  },

  module: {
    rules: [
      {test: /\.ts$/, loader: "awesome-typescript-loader"}
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(process.env.PRODUCTION || false)
    })
  ]
};
