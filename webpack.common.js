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
  }
};
