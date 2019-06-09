const axios = require('axios');

const { TRANSLATOR_URL, TRANSLATOR_KEY } = process.env;

class Translator {
  static async translate(text, from, to) {
    const res = await axios.get(TRANSLATOR_URL, {
      params: {
        text,
        key: TRANSLATOR_KEY,
        lang: `${from}-${to}`,
        format: 'plain',
      },
    });

    return res.data.text[0];
  }

  static resolveAlias(alias) {
    if (!alias) {
      throw new Error('Translator: coun\'t resolve empty lang.');
    }

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in this.aliases) {
      if ((new RegExp(key)).test(alias)) {
        return this.aliases[key];
      }
    }

    throw new Error('Translator: coun\'t resolve lang.');
  }
}

Translator.aliases = {
  пиздани: 'uk',
  'бульба(ни)?': 'be',
  'шпрех(ни)?': 'de',
  'пше(кни)?': 'pl',
  'блгр(ни)?': 'bg',
  'татар(ни)?': 'tt',
  'казах(ни)?': 'kk',
  'грек(ни)?': 'el',
  'серб(ни)?': 'sr',
};

module.exports = Translator;
