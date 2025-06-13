import { type ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { type Readable } from 'stream';
import torAxios from 'tor-axios';

import config from '../config';
import logger from '../logger';

enum SSTLangCodes {
  ru = 'ru_RU',
  en = 'en_EN',
}

const TOR_PORT = 9050;

export default class TorApi {
  tor!: ReturnType<typeof torAxios.torSetup>;
  browser?: ChildProcessWithoutNullStreams;

  constructor() {
    const tor = torAxios.torSetup({
      ip: 'localhost',
      port: TOR_PORT,
    });

    this.tor = tor;
  }

  async startProcess(torPath: string) {
    const tempDir = await mkdtemp(join(tmpdir(), 'tor_'));

    const torArgs = ['--SocksPort', `${TOR_PORT}`, '--DataDirectory', tempDir];

    const browser = spawn(torPath, torArgs);

    return new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
      const onData = (chunk: any) => {
        const out = String(chunk);

        logger.debug({ out }, 'TorApi process stdout');

        if (!!out.match(/100%/)) {
          browser.stdout.off('data', onData);
          browser.off('error', onFail);
          browser.off('exit', onFail);

          resolve(browser);

          return;
        }

        if (out.includes('Problem bootstrapping')) {
          browser.stdout.off('data', onData);

          logger.error({ out }, 'TorApi process bootsrap error');

          browser.kill();

          reject();

          return;
        }
      };

      const onFail = (err: any) => {
        browser.stdout.off('data', onData);
        browser.off('error', onFail);
        browser.off('exit', onFail);

        logger.error({ error: err }, 'TorApi process failed');

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
