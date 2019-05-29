'use strict'
const test = {}

test.test = async (ctx, next) => {
  ctx.result = ctx.jwtData
  return next()
}

module.exports = test
