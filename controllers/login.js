'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')
const User = require('../models/index').getModel('user')
const login = {}

login.login = async (ctx, next) => {
    const {userName, password} = ctx.request.body
    const user = await User.findOne({userName: userName})
    if (!user) {
        ctx.result = ''
        ctx.msg = '用户不存在'
    } else {
        ctx.result = jwt.sign({
            data: user._id,
            // 设置 token 过期时间
            exp: Math.floor(Date.now() / 1000) + (60 * 60), // 60 seconds * 60 minutes = 1 hour
        }, config.secret)
    }
    return next()
}

module.exports = login
