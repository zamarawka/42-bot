import axios from 'axios';
import he from 'he';
import capitalize from 'lodash/capitalize';
import first from 'lodash/first';
import sample from 'lodash/sample';
import readYaml from 'read-yaml';
import Parser from 'rss-parser';

import { BotContext } from '../Connectors/Telegram';
import config from '../config';
import Currencies from '../services/Currencies';

const parser = new Parser();

const { weather: weatherLocale } = readYaml.sync('./i18n/ru/request.yml');
const { fails } = readYaml.sync('./i18n/ru/request.yml');

export async function news(ctx: BotContext) {
  await ctx.sendChatAction('typing');

  try {
    const feed = await parser.parseURL(config.NEWS_URL);
    const item = sample(feed.items)!;

    return ctx.replyWithMarkdown(`*${item.title}*\n\n${item.content?.trim()}`);
  } catch (e) {
    return ctx.reply(sample(fails));
  }
}

export async function bash(ctx: BotContext) {
  await ctx.sendChatAction('typing');

  try {
    const feed = await parser.parseURL(config.BASH_URL);
    const item = sample(feed.items)!;

    if (!item.content) {
      throw new Error('RSS: Bash - content not found');
    }

    return ctx.reply(`${he.decode(item.content.replace(/<br>/g, '\n'))}`);
  } catch (err: any) {
    ctx.logger.error({ err }, 'Bash request failed');

    return ctx.reply(sample(fails));
  }
}

export async function currencies(ctx: BotContext) {
  await ctx.sendChatAction('typing');

  try {
    const curr = await Currencies.load();
    const findUsd = (tiker: { name: string }) => tiker.name === 'usd';

    const replyText = Object.entries(curr)
      .sort(([, a], [, b]) => {
        if (!a && !b) {
          return 0;
        }

        if (!a) {
          return 1;
        }

        if (!b) {
          return -1;
        }

        const tikerA = a.find(findUsd);
        const tikerB = b.find(findUsd);

        return (tikerB?.buy ?? 0) - (tikerA?.buy ?? 0);
      })
      .reduce((acc, [key, value]) => {
        acc += `_${capitalize(key)}_\n`;
        if (value) {
          acc += value.map(({ name, buy }) => `*${name.toUpperCase()}*: ${buy}`).join('\n');
        } else {
          acc += '💩';
        }
        acc += '\n\n';

        return acc;
      }, '');

    return ctx.replyWithMarkdown(replyText);
  } catch (err) {
    ctx.logger.error(err, 'Request for currencies failed');

    return ctx.reply(sample(fails));
  }
}

export async function weather(ctx: BotContext) {
  await ctx.sendChatAction('typing');

  try {
    const res = await axios(config.WEATHER_URL, {
      params: {
        callback: 's',
      },
    });
    const {
      data: [, data],
    } = JSON.parse(res.data.trim().replace(/^s\(/, '').replace(/\);$/, ''));

    const forecastKey: any = first(Object.keys(data.weather));
    const forecast = data.weather[forecastKey];
    const today: any = first(forecast.days);
    const now: any = first(today.fa);
    const replyArr = [
      `*${forecast.name}* - ${today.date}\n`,
      `*${weatherLocale.now}*: ${now.weather.text} ${now.weather.icon.emoji}`,
      `*${weatherLocale.air.title}*: ${today.mi.air} ~ ${today.ma.air} ${weatherLocale.air.unit}`,
      `*${weatherLocale.pressure.title}*: ${today.mi.pressure} ~ ${today.ma.pressure} ${weatherLocale.pressure.unit}`,
      `*${weatherLocale.humidity.title}*: ${now.humidity} ${weatherLocale.humidity.unit}`,
      `*${weatherLocale.wind.title}*: ${now.wind.speed} ${weatherLocale.wind.unit}`,
    ];

    return ctx.replyWithMarkdown(replyArr.join('\n'));
  } catch (err) {
    ctx.logger.error(err, 'Request for weather failed');

    return ctx.reply(sample(fails));
  }
}
