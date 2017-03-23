/**
 * time cost
 */
const uuid = require('uuid');

const times = {};

function init(ctx) {
  if (!ctx.koatcid) {
    let id = uuid.v4();
    Object.defineProperty(ctx, 'koatcid', {
      value: id,
      writable: false
    });
    return times[id] = {
      prev: 0,
      list: [],
      diff: [],
    };
  }
  return times[ctx.koatcid];
}

function intro(ctx) {
  let time = init(ctx);
  time.list.push(+new Date);
}

function outer(ctx, callback) {
  let time = init(ctx);
  let start = time.list.pop();
  let diff = +new Date - start - time.prev;
  time.prev += diff;
  time.diff.unshift(diff);
  if (time.list.length === 0 && typeof callback === 'function') {
    let diffs = time.diff.slice(0);
    delete times[ctx.koatcid];
    callback(diffs);
  }
}

function wrap(fn, callback) {
  let temp = async (ctx, next) => {
    intro(ctx);
    await fn(ctx, next);
    outer(ctx, callback);
  }
  return temp;
}

module.exports = function(app, callback) {
  let middlewares = app.middleware;
  if (!middlewares.length) {
    const app_use = app.use;
    app.use = function(fn) {
      return app_use.call(this, wrap(fn, callback));
    };
  } else {
    throw new Error('koa-tc init need before use');
  }
  return app;
}
