const statuses = require('statuses');
const delegate = require('delegates');

const proto = module.exports = {
  onerror(err) {
    // delegate
    this.app.emit('error', err, this);

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (this.headerSent) {
      return;
    }

    const {
      res
    } = this;

    // force text/plain
    this.type = 'text';

    let statusCode = err.status || err.statusCode;

    // ENOENT support
    if ('ENOENT' === err.code) statusCode = 404;

    // default to 500
    if ('number' !== typeof statusCode || !statuses[statusCode]) statusCode = 500;

    // respond
    const code = statuses[statusCode];
    const msg = err.expose ? err.message : code;
    this.status = err.status = statusCode;
    this.length = Buffer.byteLength(msg);
    res.end(msg);
  },
};

delegate(proto, 'response')
  .method('set')
  .access('status')
  .access('body')
  .access('length')
  .access('type');

delegate(proto, 'request')
  .access('method');