/**
 * time cost
 */
const uuid = require('uuid');

const times = {};
const names = [];

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
    let data = {};
    time.diff.forEach((diff, idx) => {
      data[names[idx]] = diff;
    });
    delete times[ctx.koatcid];
    callback(data);
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
    app.use = function(fn, name) {
      name = name || fn.name || fn._name || ('index_' + names.length);
      names.push(name);
      return app_use.call(this, wrap(fn, callback));
    };
  } else {
    throw new Error('koa-tc init need before use');
  }
  return app;
}
