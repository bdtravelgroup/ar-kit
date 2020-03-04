const path = require('path');
const webpack = require('webpack');
const Memoryfs = require('memory-fs');

const i18nOptions = {
  localesLocation: path.join(__dirname, 'locales'),
  locale: process.env.LOCALE || 'en',
  defaultLocale: 'es',
  prefix: '[\\',
  suffix: '/]',
  strict: false
};

module.exports = (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: path.resolve(__dirname, fixture),
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.(txt|json)$/,
          use: {
            loader: path.resolve(__dirname, '../index.js'),
            options: {
              ...i18nOptions,
              strict: options.strict || i18nOptions.strict,
              locale: options.lang || 'en',
              localesLocation: path.resolve(__dirname, 'locales')
            }
          }
        }
      ]
    }
  });

  compiler.outputFileSystem = new Memoryfs();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors));

      resolve(stats);
    });
  });
};
