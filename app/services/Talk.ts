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
`;

const rapSystemPromt = `
Ты пишешь реп на русском в стиле кровостока.
Отвечай без разметки, не добавляй ничего кроме текста песни.
Не подписывай куплеты, интро и бриджи.
Используй sil<[t]>, где t - длительность в миллисекундах, для пауз.
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
