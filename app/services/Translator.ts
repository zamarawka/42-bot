import axios from 'axios';

import envConfig from '../config';

export default class Translator {
  static async translate(text: string, from: string, to: string) {
    const res = await axios.get(envConfig.TRANSLATOR_URL, {
      params: {
        text,
        key: envConfig.TRANSLATOR_KEY,
        lang: `${from}-${to}`,
        format: 'plain',
      },
    });

    return res.data.text[0];
  }

  static resolveAlias(alias: string) {
    if (!alias) {
      throw new Error("Translator: coun't resolve empty lang.");
    }

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in this.aliases) {
      if (new RegExp(key).test(alias)) {
        return this.aliases[key as keyof typeof this.aliases];
      }
    }

    throw new Error("Translator: coun't resolve lang.");
  }

  static aliases = {
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
}
