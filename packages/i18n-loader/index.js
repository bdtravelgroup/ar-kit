const { getOptions } = require('loader-utils');
const validateOptions = require('schema-utils');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const gettextParser = require('gettext-parser');
const flatMap = require('lodash/flatMap');
const merge = require('lodash/merge');
const noop = require('lodash/noop');
const espaceRegExp = require('lodash/escapeRegExp');

const schema = {
  type: 'object',
  properties: {
    localesLocation: {
      type: 'string'
    },
    locale: {
      type: 'string'
    },
    defaultLocale: {
      type: 'string'
    },
    prefix: {
      type: 'string'
    },
    suffix: {
      type: 'string'
    },
    strict: {
      type: 'boolean'
    }
  }
};

const matchLineNumber = match => {
  if (!match) {
    return -1;
  }
  let line = 1;
  for (let i = 0; i < match.index; i += 1) {
    if (match.input[i] === '\n') {
      line += 1;
    }
  }
  return line;
};

module.exports = function i18n(content) {
  let transformedContent = content;
  const options = getOptions(this);
  validateOptions(schema, options, { name: 'Andromeda i18n Loader' });

  const webpack = this;

  const log = webpack.getLogger();

  if (webpack.cacheable) {
    webpack.cacheable();
  }

  const { localesLocation, locale, defaultLocale, prefix, suffix, strict } = options;

  const regex = new RegExp(`${espaceRegExp(prefix)}(.*?)${espaceRegExp(suffix)}`, 'g');

  const resourcePathNodeModulesIndex = webpack.resourcePath.indexOf('node_modules');

  const resourceRelativePathBase = ~resourcePathNodeModulesIndex
    ? webpack.resourcePath.replace(webpack.resourcePath.substr(0, resourcePathNodeModulesIndex + 12), '')
    : webpack.resourcePath.replace(webpack.rootContext, '');

  const resourceLocaleBasePath = path.join(
    localesLocation,
    resourceRelativePathBase
      .substr(1, resourceRelativePathBase.length - 1)
      .replace(/\/|\\/g, '_')
      .replace(path.extname(webpack.resourcePath), '')
  );

  const localeFilePath = locale === defaultLocale ? '<ignore>' : `${resourceLocaleBasePath}.${locale}.po`;

  const defaultLocaleFilePath = `${resourceLocaleBasePath}.${defaultLocale}.po`;

  const globbedLocaleFilePaths = `${resourceLocaleBasePath}.*.po`;

  const defaultLocaleFileContent = {
    charset: 'utf-8',
    headers: {
      // eslint-disable-next-line prettier/prettier
      'Language': defaultLocale,
      'MIME-Version': '1.0',
      'Content-Type': 'text/plain; charset=UTF-8',
      'Content-Transfer-Encoding': '8bit'
    },
    translations: { '': {} }
  };

  const defaultLocaleTranslations = defaultLocaleFileContent.translations[''];

  if (!regex.exec(content)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const f of glob.sync(globbedLocaleFilePaths)) {
      fs.unlink(f, noop);
    }
    return content;
  }

  const localeFileExists = fs.existsSync(localeFilePath);

  if (localeFileExists) {
    this.addDependency(localeFilePath);
  }

  const localeData = localeFileExists
    ? gettextParser.po.parse(fs.readFileSync(localeFilePath))
    : { translations: { '': {} } };

  const translations = merge({}, ...flatMap(localeData.translations, (k, v) => localeData.translations[v]));

  let match;

  regex.lastIndex = 0;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(content)) !== null) {
    const matchedMessage = match[0];
    const key = match[1];
    const translation = translations[key];
    const reference = `${resourceRelativePathBase
      .substr(1, resourceRelativePathBase.length - 1)
      .replace(/\\/g, '/')}:${matchLineNumber(match)}`;

    defaultLocaleTranslations[key] = {
      comments: { reference },
      msgid: key,
      msgstr: [key]
    };

    if (translation) {
      const msgstr = translation.msgstr.join(' ').trim();
      if (msgstr.length > 0) {
        transformedContent = transformedContent.replace(new RegExp(espaceRegExp(matchedMessage), 'g'), msgstr);
        // eslint-disable-next-line no-continue
        continue;
      }
    }
    if (locale === defaultLocale || (!localeFileExists && !strict)) {
      transformedContent = transformedContent.replace(new RegExp(espaceRegExp(matchedMessage), 'g'), key);
    }

    const missingTranslationError = new Error(
      `[ERROR i18n] Translation for key "${key}" and reference ${reference} is missing in ${localeFilePath}`
    );

    if (strict) {
      webpack.emitError(missingTranslationError);
    }

    if (!strict && !translation) {
      webpack.emitWarning(missingTranslationError);
    }
  }

  log.info(`Emiting i18n resource file ${defaultLocaleFilePath}`);

  if (Object.keys(defaultLocaleTranslations).length > 0) {
    fs.writeFile(defaultLocaleFilePath, gettextParser.po.compile(defaultLocaleFileContent), { encoding: 'utf8' }, noop);
  } else {
    fs.unlink(defaultLocaleFilePath, noop);
    fs.unlink(localeFilePath, noop);
  }

  return transformedContent;
};
module.exports.separable = false;
