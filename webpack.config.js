var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './frontend/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.min.js',
        libraryTarget: 'umd'
    },
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({ /* additional options here */ })],
    },
    module: {
        rules: [
            {
                test:/\.s?css$/,
                // exclude: /(node_modules|bower_components|build)/,
                use:['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|build)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader',
                ]
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),
        new HtmlWebpackPlugin({
            hash: true,
            template: './index.html',
            filename: './index.html'
        })
    ]
};
