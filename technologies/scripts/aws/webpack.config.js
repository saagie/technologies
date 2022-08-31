const path = require('path');

module.exports = {
  target: 'node16',
  mode: 'production',
  entry: {
    'check-connection': './src/check-connection.js',
    'job-form': './src/job-form.js',
    'batch-job-actions': './src/batch-job-actions.js',
    'emr-clone-step-actions': './src/emr-clone-step-actions.js',
    'glue-crawler-actions': './src/glue-crawler-actions.js',
    'glue-job-actions': './src/glue-job-actions.js',
    'glue-workflow-actions': './src/glue-workflow-actions.js',
    'lambda-functions-actions': './src/lambda-functions-actions.js',
    'sagemaker-clone-trainingjob-actions': './src/sagemaker-clone-trainingjob-actions.js',
    'step-functions-workflow-actions': './src/step-functions-workflow-actions.js'
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
