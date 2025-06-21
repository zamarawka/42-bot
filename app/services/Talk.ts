import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

import config from '../config';

const openai = new OpenAI({
  baseURL: config.LLM_BASE_URL,
  apiKey: config.LLM_API_KEY,
});

const phraseSystemPromt = `
Ты отвечаешь в стиле 2ch /b/. Не используй форумную разметку.
Ты находишься в чате телеграм, используй подходящую разметку.
Отвечай коротко и дерзко.

When formatting your responses for Telegram, please use these special formatting conventions:

1. For content that should be hidden as a spoiler (revealed only when users click):
   Use: ||spoiler content here||
   Example: This is visible, but ||this is hidden until clicked||.

2. Continue using standard markdown for other formatting:
   - **bold text**
   - *italic text*
   - __underlined text__
   - ~~strikethrough~~
   - \`inline code\`
   - \`\`\`lang
     code blocks\`\`\`
   - [link text](URL)
`;

const rapSystemPromt = `
Ты пишешь реп на русском в стиле кровостока.
Отвечай без разметки, не добавляй ничего кроме текста песни.
Не подписывай куплеты, интро и бриджи.
Используй sil<[t]>, где t - длительность в миллисекундах, для пауз. Пример: "Раз, два, три sil<[300]> подожди".
Текст должен быть готов для передачи в сервисы синтеза речи.
`;

export default class Talk {
  static async phrase(query: string, context?: string) {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: phraseSystemPromt,
      },
    ];

    if (context) {
      messages.push({ role: 'assistant', content: context });
    }

    messages.push({ role: 'user', content: query });

    const completion = await openai.chat.completions.create({
      messages,
      model: config.LLM_LIGHT_MODEL,
    });

    const text = completion.choices[0]?.message.content;

    if (!text) {
      throw Error('Talk@phrase: creation error!');
    }

    return text;
  }

  static async rap(about: string) {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: rapSystemPromt,
        },
        { role: 'user', content: about },
      ],
      model: config.LLM_HEAVY_MODEL,
    });

    return completion.choices[0]?.message.content ?? null;
  }
}
