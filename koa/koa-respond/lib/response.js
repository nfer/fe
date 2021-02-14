const getType = require('cache-content-type');
const statuses = require('statuses');
const assert = require('assert');

module.exports = {
  get status() {
    return this.res.statusCode;
  },
  set status(code) {
    assert(Number.isInteger(code), 'status code must be a number');
    assert(code >= 100 && code <= 999, `invalid status code: ${code}`);
    this.res.statusCode = code;
    if (this.req.httpVersionMajor < 2) this.res.statusMessage = statuses[code];
  },
  set type(type) {
    type = getType(type);
    this.set('Content-Type', type);
  },
  get body() {
    return this._body;
  },
  set body(val) {
    this._body = val;

    // no content
    if (null == val) {
      if (!statuses.empty[this.status]) this.status = 204;
      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    // set the status
    this.status = 200;

    // set the content-type only if not yet set
    const setType = !this.has('Content-Type');

    // string
    if ('string' === typeof val) {
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }
  },
  set length(n) {
    this.set('Content-Length', n);
  },
  get length() {
    if (this.has('Content-Length')) {
      return parseInt(this.get('Content-Length'), 10) || 0;
    }

    const { body } = this;
    if ('string' === typeof body) return Buffer.byteLength(body);
  },
  has(field) {
    return this.res.hasHeader(field);
  },
  set(field, val) {
    if (Array.isArray(val)) val = val.map(v => typeof v === 'string' ? v : String(v));
    else if (typeof val !== 'string') val = String(val);
    this.res.setHeader(field, val);
  },
  remove(field) {
    this.res.removeHeader(field);
  },
};
