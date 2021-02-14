const Koa = require('./lib/application.js');
const app = new Koa();

app.on('error', (err, ctx) => {
    console.log('catch error', err, ctx.req.url)
});

app
    .use(async (ctx, next) => {
        ctx.body = 'hello world';
    })
    .listen('3000', () => {
        console.log('listening on port 3000');
    });