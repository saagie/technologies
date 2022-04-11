const path = require('path');

module.exports = {
  target: 'node16',
  mode: 'production',
  entry: {
    'job-form': './src/job-form.js',
    'datasets-actions': './src/datasets-actions.js',
    'scenario-actions': './src/scenario-actions.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/transform-runtime']
            ]
          }
        }
      }
    ],
  },
  output: {
    library: {
      type: 'commonjs',
    },
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
};
