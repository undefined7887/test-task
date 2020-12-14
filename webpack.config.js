const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let buildMode = process.env.BUILD_MODE
let buildPath = path.join(__dirname, "build");

module.exports = {
  mode: buildMode,
  entry: "./src/index.tsx",
  devtool: buildMode === "development" ? "source-map" : false,
  output: {
    path: buildPath,
    filename: "index.js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".css"],
    alias: {
      src: path.resolve(__dirname + "/src"),
      assets: path.resolve(__dirname + "/assets"),
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: 'singletonStyleTag',
              attributes: {
                type: 'text/css'
              }
            }
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]_[local]_[hash:base64:5]"
              },
            }
          }
        ]
      },
      {
        test: /(\.png|\.jpg|\.gif)$/,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html"
    })
  ],
  devServer: {
    contentBase: buildPath,
    compress: true,
    host: "127.0.0.1",
    port: 8080
  }
};
