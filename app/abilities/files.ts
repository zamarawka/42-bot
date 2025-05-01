import giphyApi from 'giphy-api';
import { google } from 'googleapis';
import sample from 'lodash/sample';
import readYaml from 'read-yaml';

import { BotContextFor } from '../Connectors/Telegram';
import envConfig from '../config';

const customSearch = google.customsearch('v1');
const giphy = giphyApi(envConfig.GIPHY_KEY);
const { search, apiLimit, fails } = readYaml.sync('./i18n/ru/request.yml');

export async function photo(ctx: BotContextFor<'text'>) {
  try {
    const { q } = ctx.match.groups!;

    await ctx.sendChatAction('upload_photo');

    const config = sample(envConfig.GOOGLE)!;

    const results = await customSearch.cse.list({
      q,
      searchType: 'image',
      imgSize: 'large',
      num: 10,
      cx: config.cx_key,
      auth: config.api_key,
    });

    const { data } = results;

    if (parseInt(data.searchInformation?.totalResults ?? '0') < 1) {
      ctx.logger.info(
        {
          q,
          some: data.searchInformation,
          searchConfig: config,
        },
        'Empty photo search results',
      );

      return ctx.reply(sample(search));
    }

    const image = sample(data.items)!;

    return (image.mime?.search(/gif/i) ?? 0) > 0
      ? await ctx.replyWithAnimation(image.link!)
      : await ctx.replyWithPhoto(image.link!);
  } catch (err: any) {
    if (err?.errors && err.errors[0].reason === 'dailyLimitExceeded') {
      ctx.logger.error(err.config, 'Daily limit for google search exceeded');

      return ctx.reply(sample(apiLimit));
    }

    ctx.logger.error({ err }, 'Unhandled photo search error');

    return ctx.reply(sample(fails));
  }
}

// const checkRegexp = /\p{Script=Cyrillic}/u;

export async function gif(ctx: BotContextFor<'text'>) {
  await ctx.sendChatAction('upload_document');

  try {
    let { q } = ctx.match.groups!;

    // if (checkRegexp.test(q)) {
    //   q = await Translator.translate(q.trim(), 'ru', 'en');
    // }

    const { data } = await giphy.random(q);

    return await ctx.replyWithAnimation(data.images.fixed_height.url);
  } catch (err) {
    ctx.logger.error({ err }, 'Unhandled gif search error');

    return ctx.reply(sample(search));
  }
}
