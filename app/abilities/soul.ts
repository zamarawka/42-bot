import axios from 'axios';
import parser from 'fast-xml-parser';
import telegramFormat from 'formatter-chatgpt-telegram';
import sample from 'lodash/sample';
import transform from 'lodash/transform';
import readYaml from 'read-yaml';
import { Readable } from 'stream';
import { Input } from 'telegraf';

import { BotContext, BotContextFor } from '../Connectors/Telegram';
import config from '../config';
import Speech from '../services/Speech';
import Talk from '../services/Talk';
import Translator from '../services/Translator';

const { fails } = readYaml.sync('./i18n/ru/horoscope.yml');
const {
  angryBot,
  fails: reqFails,
  translate: i18nTranslate,
  search,
} = readYaml.sync('./i18n/ru/request.yml');

export async function predict(ctx: BotContext) {
  ctx.sendChatAction('typing');

  try {
    const res = await axios.get(config.HOROSCORE_URL);

    const predicts = transform(
      parser.parse(res.data).horo,
      (acc, predict, key) => {
        if (key !== 'date') {
          acc.push(predict);
        }
      },
      [] as any[],
    );

    const predictInd = ctx.currentUser.todayNumber % predicts.length;

    return await ctx.reply(predicts[predictInd].today);
  } catch (e) {
    return ctx.reply(sample(fails));
  }
}

export async function quote(ctx: BotContext) {
  ctx.sendChatAction('typing');

  try {
    const res = await axios.get(config.QUOTE_URL);
    const { quoteText, quoteAuthor } = res.data;
    let quote = `${quoteText}`;

    if (quoteAuthor) {
      quote += `\n\n_${quoteAuthor}_`;
    }

    return await ctx.replyWithMarkdown(quote);
  } catch (e) {
    return ctx.reply(sample(fails));
  }
}

export async function translate(ctx: BotContextFor<'text'>) {
  ctx.sendChatAction('typing');

  const { lang, text } = ctx.match.groups!;

  try {
    const fromLang = Translator.resolveAlias(lang);

    const translatedText = await Translator.translate(text, 'ru', fromLang);

    return await ctx.reply(translatedText);
  } catch (e) {
    return ctx.reply(sample(i18nTranslate));
  }
}

export async function rap(ctx: BotContextFor<'text'>) {
  const { track = 'крово', text } = ctx.match.groups!;

  if (!text || text.length > 2500) {
    return ctx.reply(sample(angryBot));
  }

  return ctx.persistentChatAction('record_voice', async (): Promise<any> => {
    try {
      const trackFile = Speech.resolveAlias(track);

      const source = await Speech.rap(text, trackFile);

      source.on('error', (err: any) => {
        ctx.logger.error({ text, track, err }, 'Rap source error.');

        ctx.reply(sample(reqFails));
      });

      return await ctx.replyWithVoice(Input.fromReadableStream(source as Readable));
    } catch (err) {
      ctx.logger.error({ text, track, err }, 'Rap request failed');

      return ctx.reply(sample(reqFails));
    }
  });
}

export async function rapping(ctx: BotContextFor<'text'>) {
  const { track = 'крово', about } = ctx.match.groups!;

  if (!about || about.length > 2500) {
    return ctx.reply(sample(angryBot));
  }

  return ctx.persistentChatAction('record_voice', async (): Promise<any> => {
    try {
      const text = await Talk.rap(about);

      if (!text) {
        return ctx.reply(sample(reqFails));
      }

      ctx.logger.info({ text }, 'Rapping text generation.');

      const trackFile = Speech.resolveAlias(track);
      const source = await Speech.rap(text, trackFile);

      source.on('error', (err: any) => {
        ctx.logger.error({ text, track, err }, 'Rapping source error.');

        ctx.reply(sample(reqFails));
      });

      return await ctx.replyWithVoice(Input.fromReadableStream(source as Readable));
    } catch (err) {
      ctx.logger.error({ about, track, err }, 'Rapping request failed');

      return ctx.reply(sample(reqFails));
    }
  });
}

export async function quest(ctx: BotContextFor<'text'>) {
  ctx.sendChatAction('typing');

  const { text } = ctx.match.groups!;

  try {
    const replyText = await Talk.phrase(text);

    return await ctx.replyWithHTML(telegramFormat(replyText));
  } catch (err) {
    ctx.logger.error({ err }, 'Quest request failed');

    return ctx.reply(sample(search));
  }
}
