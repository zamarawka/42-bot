const TorSpeech = require('tor-speech');
const { Readable, Transform } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const { resolve } = require('path');

class Speech {
  static async connect() {
    this.speechApi = await TorSpeech();
  }

  static async talk(text, isBuffer = false) {
    if (!text) {
      throw new Error('Speech@talk: text as 1\'st argument should be provided!');
    }

    if (!this.speechApi) {
      await this.connect();
    }

    const base64 = await this.speechApi.yandex({
      text,
    });

    if (!base64) {
      throw new Error('Speech@talk something going wrong. File not reviced.');
    }

    return isBuffer ? Buffer.from(base64.replace('data:audio/wav;base64,', ''), 'base64') : base64;
  }

  static mix(buffer, track) {
    const stream = new Readable({
      read: () => {},
    });
    stream.push(buffer);
    stream.push(null);

    const output = new Transform({
      transform: (chunk, enc, cb) => cb(null, chunk),
    });

    ffmpeg()
      .input(stream)
      .input(track)
      // .complexFilter('[0:0]volume=1[a];[1:0]volume=0.78[b];[a][b]amix=inputs=2:duration=first')
      .complexFilter('[0:a]asplit=2[sc][mix];[1:a][sc]sidechaincompress=threshold=0.1:ratio=20[bg]; [bg][mix]amerge[final]', 'final')
      .audioCodec('opus')
      .format('ogg')
      .output(output)
      .on('error', (err) => {
        output.destroy(err);
      })
      .on('end', () => {
        output.end();
      })
      .run();

    return output;
  }

  static resolveAlias(alias) {
    if (!alias) {
      throw new Error('Speech: coun\'t resolve empty track.');
    }

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in this.aliases) {
      if ((new RegExp(key)).test(alias)) {
        return this.aliases[key];
      }
    }

    throw new Error('Speech: coun\'t resolve track.');
  }

  static async rap(text, track) {
    const talk = await this.talk(text, true);

    return this.mix(talk, resolve(__dirname, `./bits/${track}.mp3`));
  }

  static kill() {
    if (this.speechApi) {
      this.speechApi.killTor();
    }
  }
}

Speech.aliases = {
  крово: 'biographia',
  '(вутанг|крем|хлам)': 'cream',
  '(50(\\sцентов|копеек)?|полтин(н+)?ика|и\\sда\\sклаб)': 'in_da_club',
  '(dre|др(е|э))': 'dre',
  '((как\\sв\\s)?93)': '93',
};

module.exports = Speech;
