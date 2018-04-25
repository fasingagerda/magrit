const webpack = require('webpack');
const exec = require('child_process').exec;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = [{
  entry: {
    app: './js/main.js'
  },
  output: {
    filename: '[name].js'
  },
  mode: 'development',
  module: {
    rules: [
      // {
      //   enforce: "pre",
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   loader: "eslint-loader",
      // },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: [
          /node_modules/
        ]
      },
     {
       test:/\.css$/,
       use:['style-loader','css-loader']
     }
    ]
  },
  // optimization: {
  //     splitChunks: {
  //         cacheGroups: {
  //             commons: {
  //                 test: /[\\/]node_modules[\\/]/,
  //                 name: 'd3',
  //                 chunks: 'all'
  //             }
  //         }
  //     }
  // },
  plugins: [
    new webpack.ProvidePlugin({
        'Promise': 'bluebird'
    }),
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          exec('./post_build.sh', (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });
      }
    }
  ],
  watchOptions: {
    poll: true
  }
},{
  entry: "./js/d3_custom.js",
  output: {
    filename: "d3.custom.min.js",
    library: "d3"
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: [
          /node_modules/
        ]
      },
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: false,
          ecma: 6,
          mangle: false
        }
      })
    ]
  }
}];