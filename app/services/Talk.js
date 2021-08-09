const axios = require('axios');

const {
  TALK_URL: url,
} = process.env;

class Talk {
  static async phrase(query, theme = 'default') {
    const intro = this.themes.indexOf(theme);

    if (intro === -1 || !query) {
      throw new Error('Talk@phrase: empty request!');
    }

    const { data } = await axios({
      url,
      method: 'POST',
      data: {
        query,
        intro,
        filter: 1,
      },
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Origin: 'https://yandex.ru',
        Referer: 'https://yandex.ru/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
      },
    });

    if (data.bad_query || data.error) {
      throw Error('Talk@phrase: creation error!');
    }

    return data;
  }
}

Talk.themes = [
  'default',
  'сonspiracy_theories',
  'tv_reports',
  'toasts',
  'kid_quotes',
  'adv_slogans',
  'short_stories',
  'instagram_captions',
  'shorter_wiki',
  'movie_synopses',
  'horoscope',
  'folk_wisdom',
];

module.exports = Talk;
