const path = require('path');

module.exports = {
  target: 'node16',
  mode: 'production',
  entry: {
    'job-form': './src/job-form.js',
    'data-factory-actions': './src/data-factory-actions.js',
    'databricks-actions': './src/databricks-actions.js',
    'functions-actions': './src/functions-actions.js',
    'machine-learning-actions': './src/machine-learning-actions.js',
    'machine-learning-pipeline-actions': './src/machine-learning-pipeline-actions.js',
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
