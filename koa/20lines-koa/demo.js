const Koa = require('./lib/application.js');
const app = new Koa();

app
    .use(async (ctx, next) => {
        console.log('>> one in');
        await next();
        console.log('<< one out');
    })
    .use(async (ctx, next) => {
        console.log('>> two in');
        await next();
        console.log('<< two out');
    })
    .use(async (ctx, next) => {
        console.log('>> hello in');
        ctx.body = 'hello world';
        await next();
        console.log('<< hello out');
    })
    .listen('3000', () => {
        console.log('listening on port 3000');
    });