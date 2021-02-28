const getType = require('cache-content-type');
const statuses = require('statuses');
const onFinish = require('on-finished');
const destroy = require('destroy');
const assert = require('assert');
const Stream = require('stream');

module.exports = {
  get status() {
    return this.res.statusCode;
  },
  set status(code) {
    if (this.headerSent) return;

    assert(Number.isInteger(code), 'status code must be a number');
    assert(code >= 100 && code <= 999, `invalid status code: ${code}`);
    this._explicitStatus = true;
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
    const original = this._body;
    this._body = val;

    // no content
    if (null == val) {
      if (!statuses.empty[this.status]) this.status = 204;
      if (val === null) this._explicitNullBody = true;
      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    // set the status
    if (!this._explicitStatus) this.status = 200;

    // set the content-type only if not yet set
    const setType = !this.has('Content-Type');

    // string
    if ('string' === typeof val) {
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }

    // buffer
    if (Buffer.isBuffer(val)) {
      if (setType) this.type = 'bin';
      this.length = val.length;
      return;
    }

    // stream
    if (val instanceof Stream) {
      onFinish(this.res, destroy.bind(null, val));
      if (original != val) {
        val.once('error', err => this.ctx.onerror(err));
        // overwriting
        if (null != original) this.remove('Content-Length');
      }

      if (setType) this.type = 'bin';
      return;
    }

    // json
    this.remove('Content-Length');
    this.type = 'json';
  },
  set length(n) {
    this.set('Content-Length', n);
  },
  get length() {
    if (this.has('Content-Length')) {
      return parseInt(this.get('Content-Length'), 10) || 0;
    }

    const { body } = this;
    if (!body || body instanceof Stream) return undefined;
    if ('string' === typeof body) return Buffer.byteLength(body);
    if (Buffer.isBuffer(body)) return body.length;
    return Buffer.byteLength(JSON.stringify(body));
  },

  /**
   * Check if a header has been written to the socket.
   *
   * @return {Boolean}
   * @api public
   */

  get headerSent() {
    return this.res.headersSent;
  },

  has(field) {
    return this.res.hasHeader(field);
  },
  set(field, val) {
    if (this.headerSent) return;

    if (Array.isArray(val)) val = val.map(v => typeof v === 'string' ? v : String(v));
    else if (typeof val !== 'string') val = String(val);
    this.res.setHeader(field, val);
  },
  remove(field) {
    if (this.headerSent) return;

    this.res.removeHeader(field);
  },
};
