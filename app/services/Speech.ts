import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

import logger from '../logger';
import { resources } from '../utils';
import TorApi from './TorApi';

export default class Speech {
  static aliases = {
    крово: 'biographia',
    '(вутанг|крем|хлам)': 'cream',
    '(50(\\sцентов|копеек)?|полтин(н+)?ика|и\\sда\\sклаб)': 'in_da_club',
    '(dre|др(е|э))': 'dre',
    '((как\\sв\\s)?93)': '93',
  };

  static torApi: TorApi;

  static async connect() {
    this.torApi = new TorApi();
  }

  static async talk(text: string) {
    if (!text) {
      throw new Error("Speech@talk: text as 1'st argument should be provided!");
    }

    if (!this.torApi) {
      this.connect();
    }

    const speech = await this.torApi.textToSpeech({
      text,
    });

    if (!speech) {
      throw new Error('Speech@talk something going wrong. File not reviced.');
    }

    return speech;
  }

  static mix(speech: Readable, track: string) {
    const command = ffmpeg()
      .input(speech)
      .input(track)
      // .complexFilter('[0:0]volume=1[a];[1:0]volume=0.78[b];[a][b]amix=inputs=2:duration=first')
      // .complexFilter(
      //   '[0:a]asplit=2[sc][mix];[1:a][sc]sidechaincompress=threshold=0.1:ratio=20[bg]; [bg][mix]amerge[final]',
      //   'final',
      // )
      // .complexFilter(
      //   `[0:a]highpass=80,asplit=2[sc][mix];
      //   [1:a]volume=0.8[music];
      //   [music][sc]sidechaincompress=threshold=0.05:ratio=20:attack=10:release=500[bg];
      //   [bg][mix]amerge=inputs=2[final]`,
      //   'final',
      // )
      .complexFilter(
        `[0:a]highpass=80,
        lowpass=15000,
        equalizer=f=2000:width_type=o:width=1:gain=3
        [vocal];
        [1:a]volume=0.9[music];
        [vocal]asplit=2[sc][mix];
        [music][sc]sidechaincompress=threshold=0.05:ratio=20:attack=10:release=500:knee=4[bg];
        [bg][mix]amerge[final]`,
        'final',
      )
      .audioCodec('opus')
      .format('ogg');

    const output = command.pipe();

    command.on('error', (err: any) => {
      logger.error({ err }, 'Speech mix error occured');

      output.destroy(err);
    });

    return output;
  }

  static resolveAlias(alias: string) {
    if (!alias) {
      throw new Error("Speech: coun't resolve empty track.");
    }

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in this.aliases) {
      if (new RegExp(key).test(alias)) {
        return this.aliases[key as keyof typeof this.aliases];
      }
    }

    throw new Error("Speech: coun't resolve track.");
  }

  static async rap(text: string, track: string) {
    const talk = await this.talk(text);

    return this.mix(talk, resources(`./bits/${track}.mp3`));
  }

  static kill() {
    if (this.torApi) {
      this.torApi.destroy();
    }
  }
}
