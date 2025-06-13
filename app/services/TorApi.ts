import { type ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { type Readable } from 'stream';
import torAxios from 'tor-axios';

import config from '../config';
import logger from '../logger';

enum SSTLangCodes {
  ru = 'ru_RU',
  en = 'en_EN',
}

export default class TorApi {
  tor!: ReturnType<typeof torAxios.torSetup>;
  browser?: ChildProcessWithoutNullStreams;

  constructor() {
    const tor = torAxios.torSetup({
      ip: 'localhost',
      port: 9050,
    });

    this.tor = tor;
  }

  startProcess(torPath: string) {
    const browser = spawn(torPath);

    return new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
      const onData = (chunk: any) => {
        logger.debug({ out: String(chunk) }, 'TorApi process stdout');

        if (!!String(chunk).match(/100%/)) {
          browser.stdout.off('data', onData);
          browser.off('error', onFail);
          browser.off('exit', onFail);

          resolve(browser);
        }
      };

      const onFail = () => {
        browser.stdout.off('data', onData);
        browser.off('error', onFail);
        browser.off('exit', onFail);

        reject();
      };

      browser.stdout.on('data', onData);

      browser.once('error', onFail);
      browser.once('exit', onFail);
    });
  }

  onStop = () => {
    this.browser = undefined;
  };

  processManage() {
    if (!this.browser) {
      throw new Error('Process is dead!');
    }

    this.browser.once('error', this.onStop);
    this.browser.once('exit', this.onStop);
  }

  async runProcess() {
    logger.info('TorApi: start process');

    this.browser = await this.startProcess(config.TOR_PATH);

    logger.info('TorApi: browser is active');

    this.processManage();
  }

  destroy() {
    if (!this.browser) {
      return;
    }

    this.browser.off('error', this.onStop);
    this.browser.off('exit', this.onStop);

    this.browser.kill();
    this.browser = undefined;
  }

  async textToSpeech({
    text,
    langCode = SSTLangCodes.ru,
  }: {
    text: string;
    langCode?: SSTLangCodes;
  }): Promise<Readable> {
    if (!this.browser) {
      await this.runProcess();
    }

    const { data } = await this.tor.get(config.TTS_URL, {
      responseType: 'stream',
      params: {
        text: text,
        lang: langCode,
        format: 'mp3',
        // speed: 0.1 - 3.0,
        // emotion: 'neutral' | 'friendly' | 'whisper',
      },
    });

    return data;
  }
}
