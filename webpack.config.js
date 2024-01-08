/* global __dirname */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ImageminWebpWebpackPlugin = require("imagemin-webp-webpack-plugin");

module.exports = {
  mode: "development", // или 'production'
  entry: path.join(__dirname, "src", "index.js"), // ваши основные файлы
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    assetModuleFilename: "images/[name].[contenthash][ext]",
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.js$/,
        use: ["babel-loader", "eslint-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(woff2?|woff|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name].[contenthash][ext]", // изменение здесь
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        use: [
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
              },
              optipng: {
                optimizationLevel: 5,
              },
              pngquant: {
                quality: [0.8, 0.9],
              },
              gifsicle: {
                interlaced: true,
              },
            },
          },
          {
            loader: "imagemin-webp",
            options: {
              quality: 75,
            },
          },
        ],
        type: "asset/resource",
        generator: {
          filename: "icons/[name].[contenthash][ext]",
        },
      },
      {
        test: /\.svg$/,
        use: ["svg-transform-loader", "svgo-loader"],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, "src/images"),
          to: path.join(__dirname, "dist/images"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"), // ваш шаблон HTML
      filename: "index.html",
    }),
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: ["dist"],
        },
        onEnd: {
          copy: [
            {
              source: path.join("src", "static"),
              destination: "dist",
            },
          ],
        },
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
  ],
  devServer: {
    watchFiles: path.join(__dirname, "src"),
    port: 9000,
  },
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              ["svgo", { name: "preset-default" }],
            ],
          },
        },
      }),
      new ImageminWebpWebpackPlugin({
        config: [
          {
            test: /\.(png|jpg|jpeg|gif)$/i,
            options: {
              quality: 75,
            },
          },
        ],
        overrideExtension: true,
      }),
    ],
  },
};
