const Koa = require('koa');
const Promise = require('bluebird');
const app = new Koa();

const ktc = require('./index');

ktc(app, (data => {
  console.log('koa time cose:', data);
}));

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`0: ${ctx.method} ${ctx.url} - ${ms}ms`);
}, 'first');

app.use(async (ctx, next) => {
  const start = new Date();
  await Promise.delay(123);
  await next();
  const ms = new Date() - start;
  console.log(`1: ${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(async (ctx) => {
  await Promise.delay(300);
  ctx.body = 'Hello Koa';
}, 'last');

app.listen(3000);