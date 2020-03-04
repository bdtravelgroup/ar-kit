const babel = require('babel-core');
const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(__dirname, 'fixtures');

const pluginPath = path.join(__dirname, '../../babel-plugin-controller-add-displayname');

function transformFile(filename) {
  return babel.transformFileSync(filename, {
    presets: ['react', 'stage-1'],
    plugins: [
      [pluginPath, { knownComponents: ['Component5a', 'Component5b', 'Component5c'] }],
      'transform-decorators-legacy'
    ]
  }).code;
}

describe('add-react-displayname transform', () => {
  fs.readdirSync(fixturesDir).forEach(fixture => {
    const actual = transformFile(path.join(fixturesDir, fixture, 'input.js'));

    it(`transforms ${path.basename(fixture)}`, () => {
      expect(actual).toMatchSnapshot();
    });
  });
});
