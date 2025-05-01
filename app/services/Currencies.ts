import axios from 'axios';
import cheerio from 'cheerio';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import maxBy from 'lodash/maxBy';

import config from '../config';

type CurrecyResponse = {
  name: string;
  sell: number;
  buy: number;
};

export default class Currencies {
  static async loadAlfa() {
    const { data } = await axios.get(config.ALFA_CURRENCIES_URL);

    return Object.keys(data).reduce((acc: CurrecyResponse[], name) => {
      const item = data[name];
      const tikerName = name.toLowerCase();

      if (['usd', 'eur'].includes(tikerName)) {
        const typedItem = item.reduce((typeAcc: any, typeItem: any) => {
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

        acc.push({
          name: tikerName,
          sell: typedItem.sell.value,
          buy: typedItem.buy.value,
        });
      }

      return acc;
    }, []) as CurrecyResponse[];
  }

  static async loadSauber() {
    const { data } = await axios.get(config.SAUBER_CURRENCIES_URL);

    const $ = cheerio.load(data);

    const result: CurrecyResponse[] = [];

    $('.widget-body .exchange-table.currency_table_1').each((index, tableEl) => {
      $(tableEl)
        .find('tr')
        .each((trIndex, trEl) => {
          if (trIndex === 0 || trIndex > 2) {
            return;
          }

          const curr: Partial<CurrecyResponse> = {};

          $(trEl)
            .find('td')
            .each((i, el) => {
              if (i > 2) {
                return;
              }

              const $el = $(el);

              if (i === 0) {
                curr.name = $el.text().toLowerCase();
              }

              const type = i === 1 ? 'buy' : 'sell';
              const price = $el.text().replace(/[^0-9.,]/gi, '');

              curr[type] = parseFloat(price);
            });

          result.push(curr as CurrecyResponse);
        });
    });

    return Object.values(groupBy(result, 'name')).map((arr) =>
      maxBy(arr, 'buy'),
    ) as CurrecyResponse[];
  }

  static async loadCrocus() {
    const { data } = await axios.get(config.CROCUS_CURRENCIES_URL);

    const $ = cheerio.load(data);

    const result: CurrecyResponse[] = [];

    $('#course table')
      .find('tr')
      .each((trIndex, trEl) => {
        if (trIndex === 0 || trIndex > 2) {
          return;
        }

        const curr: Partial<CurrecyResponse> = {};

        $(trEl)
          .find('td')
          .each((i, el) => {
            if (i > 2) {
              return;
            }

            const $el = $(el);

            if (i === 0) {
              curr.name = $el.text().toLowerCase();
            }

            const type = i === 1 ? 'buy' : 'sell';

            curr[type] = parseFloat(
              $el
                .text()
                .replace(/[^0-9.,]/gi, '')
                .replace(',', '.'),
            );
          });

        result.push(curr as CurrecyResponse);
      });

    return result;
  }

  static async loadGazprom() {
    const { data } = await axios.get(config.GAZPROM_CURRENCIES_URL);

    return data.items.map(({ ticker: name, sell, buy }: any) => ({
      name: name.toLowerCase(),
      sell,
      buy,
    })) as CurrecyResponse[];
  }

  static async loadTinkoff() {
    const res = await Promise.allSettled([
      axios.get(config.TINKOFF_CURRENCIES_URL, {
        params: {
          from: 'USD',
          to: 'RUB',
        },
      }),
      axios.get(config.TINKOFF_CURRENCIES_URL, {
        params: {
          from: 'EUR',
          to: 'RUB',
        },
      }),
    ]);

    const rates: {
      category: string;
      fromCurrency: { name: string };
      sell: number;
      buy: number;
    }[][] = res.map((res) =>
      res.status === 'fulfilled' ? get(res.value, 'data.payload.rates', null) : null,
    );
    const result = rates
      .map((rate) => {
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
      .filter((item) => item !== null) as CurrecyResponse[];

    return result.length ? result : null;
  }

  static async load() {
    const res = await Promise.allSettled([
      this.loadSauber(),
      this.loadGazprom(),
      this.loadAlfa(),
      this.loadTinkoff(),
    ]);

    const result = res.map((res) => (res.status === 'fulfilled' ? res.value : null));

    if (result.length === 0) {
      throw new Error('Currencies@load empty result');
    }

    const [sauber, gazprom, alfabank, tinkoff] = result;

    return {
      sauber,
      gazprom,
      alfabank,
      tinkoff,
    };
  }
}
