const compose = require('koa-compose');
const http = require('http');

module.exports = class Application {
  constructor() {
    this.middleware = [];
  }
  listen(...args) {
    const server = http.createServer((req, res) => {
      const ctx = {};
      const fn = compose(this.middleware);
      return fn(ctx).then(() => res.end(ctx.body));
    });
    return server.listen(...args);
  }
  use(fn) {
    this.middleware.push(fn);
    return this;
  }
};