'use strict'

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')()
const staticCache = require('koa-static-cache')
const cors = require('koa2-cors')
const helmet = require("koa-helmet")

const config = require('./config')
const publicRouter = require('./routes/public')
const privateRouter = require('./routes/private')
const { loggerMiddleware } = require('./middlewares/logger')
const { errorHandler, responseHandler } = require('./middlewares/response')
const { corsHandler } = require('./middlewares/cors')

const app = new Koa()
// console.log(process.env.NODE_ENV)
// Logger
app.use(loggerMiddleware)

// Error Handler
app.use(errorHandler)

// Global Middlewares
app.use(bodyParser)
app.use(staticCache(config.publicDir))

// Helmet
app.use(helmet())

// Cors
app.use(cors(corsHandler))

// Routes
app.use(publicRouter.routes(), publicRouter.allowedMethods())
app.use(privateRouter.routes(), privateRouter.allowedMethods())

// Response
app.use(responseHandler)

module.exports = app
