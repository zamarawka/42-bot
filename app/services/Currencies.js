const get = require('lodash/get');
const groupBy = require('lodash/groupBy');
const maxBy = require('lodash/maxBy');
const axios = require('axios');
const cheerio = require('cheerio');

const {
  SAUBER_CURRENCIES_URL,
  CROCUS_CURRENCIES_URL,
  GAZPROM_CURRENCIES_URL,
  ALFA_CURRENCIES_URL,
  TINKOFF_CURRENCIES_URL,
} = process.env;

class Currencies {
  static async loadAlfa() {
    const { data } = await axios.get(ALFA_CURRENCIES_URL);

    return Object.keys(data).reduce((acc, name) => {
      const item = data[name];
      const tikerName = name.toLowerCase();

      if (['usd', 'eur'].includes(tikerName)) {
        const result = { name: tikerName };

        const typedItem = item.reduce((typeAcc, typeItem) => {
          if (typeAcc[typeItem.type]) {
            if (new Date(typeAcc[typeItem.type].date) < new Date(typeItem.date)) {
              // eslint-disable-next-line no-param-reassign
              typeAcc[typeItem.type] = typeItem;
            }
          } else {
            // eslint-disable-next-line no-param-reassign
            typeAcc[typeItem.type] = typeItem;
          }

          return typeAcc;
        }, {});

        result.sell = typedItem.sell.value;
        result.buy = typedItem.buy.value;

        acc.push(result);
      }

      return acc;
    }, []);
  }

  static async loadSauber() {
    const { data } = await axios.get(SAUBER_CURRENCIES_URL);

    const $ = cheerio.load(data);

    const result = [];

    $('.widget-body .exchange-table.currency_table_1')
      .each((index, tableEl) => {
        $(tableEl).find('tr')
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
                const price = $el.text()
                  .replace(/[^0-9.,]/ig, '');

                curr[type] = price;
              });

            result.push(curr);
          });
      });

    return Object.values(groupBy(result, 'name')).map(arr => maxBy(arr, 'buy'));
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
              .replace(/[^0-9.,]/ig, '')
              .replace(',', '.');
          });

        result.push(curr);
      });

    return result;
  }

  static async loadGazprom() {
    const { data } = await axios.get(GAZPROM_CURRENCIES_URL);

    return data.items.map(({ ticker: name, sell, buy }) => ({
      name: name.toLowerCase(),
      sell,
      buy,
    }));
  }

  static async loadTinkoff() {
    const res = await Promise.allSettled([
      axios.get(TINKOFF_CURRENCIES_URL, {
        params: {
          from: 'USD',
          to: 'RUB',
        },
      }),
      axios.get(TINKOFF_CURRENCIES_URL, {
        params: {
          from: 'EUR',
          to: 'RUB',
        },
      }),
    ]);

    const rates = res.map(({ value }) => get(value, 'data.payload.rates', null) || null);
    const result = rates.map((rate) => {
      const curr = rate.find(({ category }) => category === 'SavingAccountTransfers');

      if (!curr) {
        return null;
      }

      return {
        name: curr.fromCurrency.name.toLowerCase(),
        sell: curr.sell,
        buy: curr.buy,
      };
    })
      .filter(item => item !== null);

    return result.length ? result : null;
  }

  static async load() {
    const res = await Promise.allSettled([
      this.loadSauber(),
      this.loadCrocus(),
      this.loadGazprom(),
      this.loadAlfa(),
      this.loadTinkoff(),
    ]);

    const result = res.map(({ value }) => value || null);

    if (result.length === 0) {
      throw new Error('Currencies@load empty result');
    }

    const [
      sauber,
      crocus,
      gazprom,
      alfabank,
      tinkoff,
    ] = result;

    return {
      sauber,
      crocus,
      gazprom,
      alfabank,
      tinkoff,
    };
  }
}

module.exports = Currencies;
