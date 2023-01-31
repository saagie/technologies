const path = require('path');

module.exports = {
  target: 'node16',
  mode: 'production',
  entry: {
    'check-connection': './src/check-connection.js',
    'job-form': './src/job-form.js',
    'ai-platform-job-actions': './src/ai-platform-job-actions.js',
    'cloud-data-fusion-actions': './src/cloud-data-fusion-actions.js',
    'cloud-data-prep-actions': './src/cloud-data-prep-actions.js',
    'cloud-data-transfer-actions': './src/cloud-data-transfer-actions.js',
    'cloud-functions-actions': './src/cloud-functions-actions.js',
    'cloud-run-actions': './src/cloud-run-actions.js',
    'dataflow-actions': './src/dataflow-actions.js',
    'kubeflow-actions': './src/kubeflow-actions.js',
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
