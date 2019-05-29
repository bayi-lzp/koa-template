'use strict'

class CodedError extends Error {
  constructor (message = '未知错误', code = -1) {
    super(message)
    this.code = code
  }
}

module.exports = {
  CodedError,
  /**
   * 拒绝访问构造函数
   */
  ForbiddenError: class ForbiddenError extends CodedError {
    constructor (message = '拒绝访问') {
      super(message, 403)
    }
  },
  /**
   * 无效的参数构造函数
   */
  InvalidQueryError: class InvalidQueryError extends CodedError {
    constructor (message = '无效的参数') {
      super(message, 400)
    }
  }
}
