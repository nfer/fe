const statuses = require('statuses');
const delegate = require('delegates');

const proto = module.exports = {
  onerror(err) {
    this.app.emit('error', err, this);

    const {
      res
    } = this;

    // force text/plain
    this.type = 'text';

    const statusCode = 500;

    // respond
    const msg = statuses[statusCode];
    this.status = statusCode;
    res.end(msg);
  },
};

delegate(proto, 'response')
  .access('status')
  .access('type');