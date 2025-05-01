import get from 'lodash/get';
import sample from 'lodash/sample';
import readYaml from 'read-yaml';
import { message as messageFilter } from 'telegraf/filters';

import { BotContext, BotContextFor } from '../Connectors/Telegram';
import Phrase from '../db/Phrase';
import Talk from '../services/Talk';
import { isAngry } from '../utils';

const replies = readYaml.sync('./i18n/ru/replies.yml');
const requests = readYaml.sync('./i18n/ru/request.yml');

export async function reply(ctx: BotContext) {
  if (ctx.has(messageFilter('text'))) {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in replies) {
      const reg = new RegExp(key, 'i');

      if (ctx.message.text.match(reg)) {
        const repl = replies[key];

        if (Array.isArray(repl)) {
          ctx.reply(sample(repl));

          return;
        }

        if (isAngry(repl.rate)) {
          ctx.reply(sample(repl.answers));

          return;
        }
      }
    }
  }

  if (ctx.currentUser.isAnnoy) {
    ctx.sendChatAction('typing');

    const phrase = await Phrase.getRandom();

    if (!phrase) {
      return;
    }

    return ctx.reply(`${ctx.currentUser.viewName}, ты ${phrase.content}`);
  }

  if (ctx.has(messageFilter('reply_to_message')) && ctx.has(messageFilter('text'))) {
    ctx.sendChatAction('typing');

    const text: string = (ctx as any).message.text;
    const replyToMessage: string | undefined = (ctx as any).message.reply_to_message.text;

    try {
      const replyText = await Talk.phrase(text, replyToMessage);

      return await ctx.reply(replyText);
    } catch (err: any) {
      ctx.logger.error({ text, replyToMessage, err }, 'Reply to message failed');

      return ctx.reply(sample(requests.search));
    }
  }
}

export async function replyYou(ctx: BotContextFor<'text'>) {
  await ctx.sendChatAction('typing');

  const newPhrase = get(ctx.match, 'groups.text', '').trim();

  if (newPhrase) {
    Phrase.create({
      user: ctx.currentUser,
      content: newPhrase,
    }).save();
  }

  const phrase = await Phrase.getRandom();

  if (!phrase) {
    return;
  }

  return ctx.reply(`${ctx.currentUser.viewName}, а ты ${phrase.content}`);
}

export async function top(ctx: BotContext) {
  ctx.sendChatAction('typing');

  const { raw: top, entities } = await Phrase.getTop();

  const table = top
    .map(({ count }, index) => `${count} - ${entities[index].user.viewName}`)
    .join('\n');

  return ctx.reply(`${table}\n\nВсего: ${top.length}`);
}

export function help(ctx: BotContext) {
  ctx.reply(requests.help.join('\n'));
}
