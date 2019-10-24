const axios = require('axios');
const cheerio = require('cheerio');

const {
  SAUBER_CURRENCIES_URL,
  CROCUS_CURRENCIES_URL,
  GAZPROM_CURRENCIES_URL,
} = process.env;

class Currencies {
  static async loadSauber() {
    const { data } = await axios.get(SAUBER_CURRENCIES_URL);

    const $ = cheerio.load(data);

    const result = [];

    $('.widget-body .exchange-table.currency_table_1')
      .eq(0)
      .find('tr')
      .each((trIndex, trEl) => {
        if (trIndex === 0 || trIndex > 2) {
          return;
        }

        const curr = {};

        $(trEl).find('td')
          .each((i, el) => {
            if (i > 2) {
              return;
            }

            const $el = $(el);

            if (i === 0) {
              curr.name = $el.text().toLowerCase();
            }

            const type = i === 1 ? 'buy' : 'sell';

            curr[type] = $el.text()
              .replace(/[^0-9.,]/ig, '');
          });

        result.push(curr);
      });

    return result;
  }

  static async loadCrocus() {
    const { data } = await axios.get(CROCUS_CURRENCIES_URL);

    const $ = cheerio.load(data);

    const result = [];

    $('#course table')
      .find('tr')
      .each((trIndex, trEl) => {
        if (trIndex === 0 || trIndex > 2) {
          return;
        }

        const curr = {};

        $(trEl).find('td')
          .each((i, el) => {
            if (i > 2) {
              return;
            }

            const $el = $(el);

            if (i === 0) {
              curr.name = $el.text().toLowerCase();
            }

            const type = i === 1 ? 'buy' : 'sell';

            curr[type] = $el.text()
              .replace(/[^0-9.,]/ig, '');
          });

        result.push(curr);
      });

    return result;
  }

  static async loadGazprom() {
    const { data } = await axios.get(GAZPROM_CURRENCIES_URL);

    return data.items.map(({ ticker: name, sell, buy }) => ({
      name,
      sell,
      buy,
    }));
  }

  static async load() {
    const res = await Promise.all([
      this.loadSauber(),
      this.loadCrocus(),
      this.loadGazprom(),
    ]);

    const [
      sauber,
      crocus,
      gazprom,
    ] = res;

    return { sauber, crocus, gazprom };
  }
}

module.exports = Currencies;
