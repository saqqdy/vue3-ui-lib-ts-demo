const path = require('path')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const TerserPlugin = require('terser-webpack-plugin')

const config = require('./config')
let plugins = [
        new ProgressBarPlugin(),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ],
    publicPath = process.env.PUBLIC_PATH || ''
if (process.env.ANALAYZ_REPORT) plugins.push(new BundleAnalyzerPlugin())
if (process.env.WEBPACK_DEV_SERVER) publicPath = 'https://127.0.0.1:9000' + publicPath

module.exports = {
    mode: 'production',
    watch: Boolean(process.env.BUILD_WATCH || false),
    entry: {
        app: ['./packages/index.ts']
    },
    devServer: {
        contentBase: path.join(__dirname, process.env.PUBLIC_PATH || ''),
        compress: true,
        host: '0.0.0.0',
        port: 9000
    },
    output: {
        path: path.resolve(process.cwd(), './dist'),
        publicPath,
        filename: 'index.js',
        chunkFilename: '[id].js',
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: 'UILIBVUE3',
        umdNamedDefine: true,
        globalObject: "typeof self !== 'undefined' ? self : this"
    },
    resolve: {
        extensions: ['.js', '.ts', '.vue', '.json'],
        alias: config.alias,
        modules: ['node_modules']
    },
    // externals: config.externals,
    externals: {
        vue: config.vueUmd
    },
    performance: {
        hints: false
    },
    stats: {
        children: false
    },
    optimization: {
        minimize: !(process.env.BUILD_WATCH || false),
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
                parallel: true,
                extractComments: false
            }),
            // 注意位置，必须放在 TerserPlugin 后面，否则生成的注释描述会被 TerserPlugin 或其它压缩插件清掉
            new webpack.BannerPlugin({
                entryOnly: true, // 是否仅在入口包中输出 banner 信息
                banner: config.bannerText
            })
        ]
    },
    module: {
        rules: [
            // {
            // 	test: /\.js$/,
            // 	// exclude: /(node_modules)/,
            // 	include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'packages')],
            // 	use: {
            // 		loader: 'babel-loader',
            // 		options: {
            // 			presets: ['@babel/preset-env'],
            // 			options: {
            // 				targets: {
            // 					ie: '11',
            // 				},
            // 				useBuiltIns: 'usage',
            // 				debug: true,
            // 				corejs: 3,
            // 			},
            // 		},
            // 	},
            // },
            {
                test: /\.(jsx?|tsx?|babel|es6)$/,
                include: process.cwd(),
                exclude: config.jsexclude,
                loader: 'babel-loader'
                // options: {
                // 	exclude: [/node_modules[\\\/]core-js/, /node_modules[\\\/]webpack[\\\/]buildin/],
                // 	presets: [
                // 		'@babel/preset-react',
                // 		[
                // 			'@babel/preset-env',
                // 			{
                // 				useBuiltIns: 'entry',
                // 				corejs: 3,
                // 				targets: '> 0.5%, not dead',
                // 			},
                // 		],
                // 	],
                // },
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    compilerOptions: {
                        preserveWhitespace: false
                    }
                }
            },
            {
                test: /\.(css|less)$/,
                use: [
                    // MiniCssExtractPlugin.loader,
                    'style-loader',
                    'css-loader',
                    'less-loader',
                    {
                        loader: 'style-resources-loader',
                        options: {
                            patterns: path.resolve(__dirname, '../packages/styles/var.less')
                        }
                    }
                ]
            },
            {
                test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    esModule: false,
                    name: path.posix.join('img', '[name].[ext]?version=' + config.version + '.[hash:7]')
                }
            }
        ]
    },
    plugins
}
