import * as xss from 'xss';

export class Sanitizer {
  static sanitize(obj) {
    return JSON.parse(xss(JSON.stringify(obj)));
  }
}
