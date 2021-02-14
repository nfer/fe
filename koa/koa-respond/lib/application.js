const compose = require('koa-compose');
const http = require('http');
const Emitter = require('events');
const response = require('./response');
const context = require('./context');
const request = require('./request');

module.exports = class Application extends Emitter {
  constructor() {
    super();
    this.middleware = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
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
      ctx.res.statusCode = 404;
      const onerror = err => ctx.onerror(err);
      const handleResponse = () => respond(ctx);
      return fn(ctx).then(handleResponse).catch(onerror);
    };
  }
  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    return context;
  }
};

function respond(ctx) {
  if ('HEAD' === ctx.method) {
    return ctx.res.end();
  }

  res.end(ctx.body);
}