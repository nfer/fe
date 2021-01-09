const compose = require('koa-compose');
const http = require('http');
const Emitter = require('events');
const response = require('./response');
const context = require('./context');

module.exports = class Application extends Emitter {
  constructor() {
    super();
    this.middleware = [];
    this.context = Object.create(context);
    this.response = Object.create(response);
  }
  listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
  use(fn) {
    this.middleware.push(fn);
    return this;
  }
  callback() {
    const fn = compose(this.middleware);
    return (req, res) => {
      const ctx = this.createContext(req, res);
      const onerror = err => ctx.onerror(err);
      return fn(ctx).then(() => res.end(ctx.body)).catch(onerror);
    };
  }
  createContext(req, res) {
    const context = Object.create(this.context);
    const response = context.response = Object.create(this.response);
    context.app = response.app = this;
    context.req = response.req = req;
    context.res = response.res = res;
    response.ctx = context;
    return context;
  }
};