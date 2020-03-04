const compiler = require('./compiler.js');

describe('Test i18n loader', () => {
  it('Should compile loader for EN', async () => {
    const stats = await compiler('translate.txt');
    const output = stats.toJson().modules[0].source;

    expect(output).toContain('counter');
  });

  it('Should compile loader for ES', async () => {
    const stats = await compiler('translate.txt', { lang: 'es' });
    const output = stats.toJson().modules[0].source;

    expect(output).toContain('contador');
  });

  it('Should compile loader with no keys file in strict mode ES', async () => {
    try {
      await compiler('translate-nokeys.txt', { strict: true, lang: 'es' });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('Should compile loader with no keys file EN', async () => {
    try {
      await compiler('translate-nokeys.txt', { lang: 'en' });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
});
