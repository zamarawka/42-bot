import random from 'lodash/random';
import uniq from 'lodash/uniq';
import { resolve } from 'path';

export const isAngry = (rate: number | string) =>
  random(100) < (typeof rate === 'number' ? rate : parseFloat(rate));

export const mergeRegexp = (left: RegExp, right: RegExp) =>
  new RegExp(left.source + right.source, uniq(left.flags + right.flags).join(''));

export function resources(path: string) {
  return resolve(__dirname, '../resources', path);
}
