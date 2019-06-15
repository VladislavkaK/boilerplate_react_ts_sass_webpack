const path = require('path');
const webpack = require('webpack');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const getBundlerConfig = (environment = 'dev', mode = 'normal', localServer = false) => {
  const devEnv = environment === 'dev';
  const audit = mode === 'audit';
  localServer = !!localServer;

  return {
    entry: getEntry(),
    output: getOutput(localServer),
    resolve: getResolve(),
    module: getModule(devEnv),
    plugins: getPlugins(devEnv, audit, localServer),
    mode: getMode(devEnv),
  }

};

const getEntry = () => {
  const main = [
    './src/index.tsx'
  ];

  const vendor =  [
    'axios',
    'babel-polyfill',
    'history',
    'immutable',
    'react',
    'react-dom',
    'react-redux',
    'react-router-dom',
    'react-router-redux',
    'redux',
    'redux-immutable',
    'redux-saga',
  ];

  return {
    main,
    vendor,
  };
};

const getOutput = (localServer) => {
  const hashSetting = localServer ? 'hash' : 'hash';
  return {
    filename: `assets/js/[name].[${hashSetting}].js`,
    chunkFilename: `assets/js/[name].[${hashSetting}].js`,
    path: path.resolve('dist'),
    publicPath: '/',
  };
};

const getResolve = () => ({
  modules: [
    'src',
    'node_modules'
  ],
  extensions: [
    '.ts',
    '.tsx',
    '.js'
  ]
});

const getModule = (devEnv) => {
  let typeScriptLoaders = [];

  if (!devEnv) {
    typeScriptLoaders.push('babel-loader');
  }

  typeScriptLoaders.push(
    {
      loader: 'awesome-typescript-loader',
      query: {
        configFileName: 'tsconfig.json',
        silent: true
      }
    },
    {
      loader: 'tslint-loader',
      query: {
        configFile: 'tslintconfig.json'
      },
    }
  );

  const styleLoaders = ExtractTextWebpackPlugin.extract({
    use: [
      {
        loader: 'css-loader',
        options: {
          minimize: !devEnv,
        }
      },
      {
        loader: 'sass-loader',
        options: {
          includePaths: ['./src']
        }
      }
    ],
  });

  const fontLoaders = [{
    loader: 'file-loader',
    options: {
      name: 'assets/fonts/[name].[ext]?[hash]',
    },
  }];

  const imageLoaders = [{
    loader: 'file-loader',
    options: {
      name: 'assets/images/[name].[ext]?[hash]',
    },
  }];

  if (!devEnv) {
    imageLoaders.push('image-webpack-loader');
  }

  return {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loaders: typeScriptLoaders,
      },
      {
        test: /\.scss$/,
        loader: styleLoaders,
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          // A missing `test` is equivalent to a match.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'assets/images/[name].[ext]?[hash]',
            },
          },
           //for svg
           {
            test: /\.svg/,
            use: {
                loader: 'svg-url-loader',
                options: {}
            }
          },
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: fontLoaders,
      },
      // {
      //   test: /\.(gif|ico|jpe?g|png)$/,
      //   loaders: imageLoaders,
      // },
    ],
  };
};

const getPlugins = (devEnv, audit, localServer) => {
  const hashSetting = localServer ? 'hash' : 'hash';
  // const envSetting = devEnv ? 'development' : 'production';

  let plugins = [
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify(devEnv ? 'development' : 'production')
      }
    }),
    new ExtractTextWebpackPlugin({
      filename: `assets/styles/style.[${hashSetting}].css`,
      allChunks: true,
    }),
    new CopyWebpackPlugin([{ from: './src/assets/', to: './assets/'}]),
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      // favicon: './src/assets/favicon.ico',
      inject: false,
      mobile: true,
      unsupportedBrowser: false,
      links: [],
      scripts: [],
      minify: devEnv ? false : {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        keepClosingSlash: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
      },
    }),
  ];

  if (devEnv) {
    plugins.push(
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin()
    );
  } else {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new CompressionWebpackPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      new ImageminPlugin({
        test: /\.(eot|svg|ttf|woff|woff2)$/,
      }),
    );
  }

  if (audit) {
    plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: '../stats/report.html'
      })
    );
  }

  return plugins;
};

const getMode = (devEnv) => devEnv ? 'development' : 'production';

module.exports = getBundlerConfig;
