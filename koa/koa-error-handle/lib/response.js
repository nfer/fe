const getType = require('cache-content-type');
const statuses = require('statuses');
const assert = require('assert');

module.exports = {
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
  set(field, val) {
    if (Array.isArray(val)) val = val.map(v => typeof v === 'string' ? v : String(v));
    else if (typeof val !== 'string') val = String(val);
    this.res.setHeader(field, val);
  },
};
