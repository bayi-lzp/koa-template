### 一、背景

结合当前的node比较火的三大框架，Express、Koa、egg。笔者之前用的Express,后面发现回调把我搞死了，实在太无奈了。终于有一天去尝试了Koa来进行开发，发现实在太舒服了。ES6语法支持很多，同步模式也很到位，但是在学习koa的过程中，发现基本的基础知识都了解了，也按照官方的文档走了一遍，但发现好像无从下手。感觉开发过程中，分层不太明显，业务逻辑简单还好，一多麻烦就来了。查看了资料后，有一个koa的脚手架叫做```koa-generator```,马上尝试后发现不是我想要的模板。看来github已经有2年没有维护了，koa2一些新特性也没有加上，感觉有点快落伍了。于是结合其他人的模式，也避免后面自己过多的重复造轮子。编写一个Koa项目的初始模板。主要遵循MVC模式，这个模板主要的功能集成了Logger、Router、JWT、Mongoose、PM2等模块，还有部分的中间件集合，该模板对于简单的后台项目来说基本够用了，没有考虑高并发处理，后期会继续完善。对于初学者来说，可以快速的新项目开发，在开始之前先好好看下面的解读。

### 二、目录结构

下面的目录是该模板基础目录结构，后面的章节会对每一个目录的配置进行介绍，让大家在开发中对项目的结构比较清晰，出了问题容易定位。


```
├─.gitignore                // 忽略文件配置
├─app.js                    // 应用入口
├─config.js                 // 公共配置文件
├─ecosystem.config.js       // pm2配置文件
├─package.json              // 依赖文件配置
├─README.md                 // README.md文档
├─routes                    // 路由
|   ├─private.js                // 校验接口
|   └public.js                  // 公开接口
├─models                    // 数据库配置及模型
|   ├─index.js                  // 数据库配置
|   └user.js                    // 用户的schema文件
├─middlewares               // 中间件
|      ├─cors.js                // 跨域中间件
|      ├─jwt.js                 // jwt中间件
|      ├─logger.js              // 日志打印中间件
|      └response.js             // 响应及异常处理中间件
├─logs                      // 日志目录
|  ├─koa-template.log
|  └koa-template.log-2019-05-28
├─lib                       // 工具库
|  ├─error.js                   // 异常处理
|  └mongoDB.js                  // mongoDB配置
├─controllers               // 操作业务逻辑
|      ├─index.js               // 配置
|      ├─login.js               // 登录
|      └test.js                 // 测试
├─services               // 操作数据库
|      ├─index.js               // 配置
|      ├─user.js               // 用户
├─bin                       // 启动目录
|  └www                         // 启动文件配置
```

### 三、搭建过程

#### 1、环境准备
因为node.js v7.6.0开始完全支持```async/await```，所以

node.js环境都要7.6.0以上

node.js环境 版本v7.6以上

npm 版本3.x以上
快速开始
安装koa2
#### 2、初始化```package.json```
```npm init```

### 3、安装koa2 
```npm install koa```

执行2、3步骤后文件中会下图文件，但是这肯定不是我们需要的，那么接下就来开始我们的搬砖起围墙。

![](https://user-gold-cdn.xitu.io/2019/5/30/16b0784a745de500?w=619&h=112&f=png&s=12222)

#### 4、新建bin文件

新建bin文件，这个目录中新建www文件,因为我们后端的项目基本上是在Linux上进行运行的，其实我们不必去担心文件的后缀是什么，只需知道该文件是可执行文件还是不可执行文件就行了。这个文件有什么用呢？其实我们这个文件是用来部署的时候可以启动我们一整个后端程序，也就是我们前端中的集成的运行环境。我们的运行、关闭、重启都在这文件进行即可。基本代码如下：
```
#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app')
const http = require('http')
const config = require('../config')

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || config.port)
// app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app.callback())

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  console.log('Listening on ' + bind)
}


```

相信用过koa-generator对这个代码斌并不陌生，这其实就是他里面的代码，express项目的www文件也基本差不多。还是希望大家可以把这里面的代码过一遍，它的基本思路就是利用了node.js中的http模块，让http暴露你的端口并进行监听，这个端口是在配置文件config.js中引入的。

#### 5、新建app.js

新建文件app.js,先简单的看一下代码

```
'use strict'

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')()
const staticCache = require('koa-static-cache')

const config = require('./config')
const publicRouter = require('./routes/public')
const privateRouter = require('./routes/private')
const { loggerMiddleware } = require('./middlewares/logger')
const { errorHandler, responseHandler } = require('./middlewares/response')

const app = new Koa()

// Logger
app.use(loggerMiddleware)

// Error Handler
app.use(errorHandler)

// Global Middlewares
app.use(bodyParser)
app.use(staticCache(config.publicDir))

// Routes
app.use(publicRouter.routes(), publicRouter.allowedMethods())
app.use(privateRouter.routes(), privateRouter.allowedMethods())

// Response
app.use(responseHandler)

module.exports = app

```
这个文件中，我们可以看到较多的中间件，中间件的执行顺序是从外到内，再从内到外，也就是洋葱模式。如果还不大了解中间的小伙伴可以去查找相关资料。中间件的执行过程是依靠``` app.use()```进行传递的，你可以简单的理解为自己编写的函数，依次去执行即可。每一个中间件会在app调用是传入2个参数，分别为： ```ctx```和```next```

    ctx:  
    Koa Context 将 node 的 request 和 response 对象封装在一个单独的对象里面，其为编写 web 应用和 API 提供了很多有用的方法。
    这些操作在HTTP服务器开发中经常使用，因此其被添加在上下文这一层，而不是更高层框架中，因此将迫使中间件需要重新实现这些常用方法。
    
    next： 
    下一个中间件函数，也就是每一个中间件如果要往下走必须写上这个，否则无法执行。
    可以理解为前端的vue-Router中的路由守卫中的next(), 执行下一步或者进行传参。
    
该文件中需要引入其他中间件，可以先引入相关的中间件，后面会一一讲解，如果出现报错，先注释掉
    
#### 6、middlewares文件

在这个项目主要用到了几个中间件，一个是``` logger.js```、``` response.js```和 ``` jwt.js```等其他中间件。我们在这个目录中新建对应中间件后，记得再app.js中进行引入，否在无法生效。记得引入顺序，可参考上面代码。

##### 1、logger.js

大家可以想一下，如果我们项目在开发中，或者上线了，我们要看我们执行的日志或者请求的参数以及报错等信息，如果没有再每一个请求中体现出来，那么遇到问题我们会很难定位到是前端的问题还是后端。而logger这个中间件就是用来对这些情况进行处理的，原来的koa模板中，只是简单的进行log的打印而已，这个中间件是用了log4js模块进行封装的。详细使用方法查看官方文档，这个中间件会在控制台或者日志中打印出固定的格式，http请求方法、返回状态、请求url、IP地址、请求时间等，而且我们也可以很好的利用log4js中的配置，来打印出自定义的日志。可以代替```console.log()```使用,在使用这个中间件的时候，必须放在第一个中间件，才能保证所以的请求及操作会先经过logger进行记录再到下一个中间件。

安装插件：```npm i log4js```, 这个文件中也需要引入```fs```, ```path```,```config.js```文件，log4的相关配置大家可以去官网进行查看，这里主要是要拿到每一个请求的请求参数方法类型等，可以根据自己需要进行添加。已经再代码中进行注释，可以边看代码边理解。

其代码如下：
```
'use strict'

const fs = require('fs')
const path = require('path')
const log4js = require('log4js')
const config = require('../config')

// 这个是判断是否有logs目录，没有就新建，用来存放日志
const logsDir = path.parse(config.logPath).dir
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir)
}
// 配置log4.js
log4js.configure({
  appenders: {
    console: { type: 'console' },
    dateFile: { type: 'dateFile', filename: config.logPath, pattern: '-yyyy-MM-dd' }
  },
  categories: {
    default: {
      appenders: ['console', 'dateFile'],
      level: 'info'
    }
  }
})

const logger = log4js.getLogger('[Default]')
// logger中间件
const loggerMiddleware = async (ctx, next) => {
// 请求开始时间
  const start = new Date()
  await next()
  // 结束时间
  const ms = new Date() - start
    // 打印出请求相关参数
  const remoteAddress = ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips ||
    (ctx.socket && (ctx.socket.remoteAddress || (ctx.socket.socket && ctx.socket.socket.remoteAddress)))
  let logText = `${ctx.method} ${ctx.status} ${ctx.url} 请求参数： ${JSON.stringify(ctx.request.body)} 响应参数： ${JSON.stringify(ctx.body)} - ${remoteAddress} - ${ms}ms`
  logger.info(logText)
}
module.exports = {
  logger,
  loggerMiddleware
}

```
##### 2、response.js

新建```response.js```这个中间件主要是用来对返回前端的响应进行处理，基础的koa模板中，我们可以用 ```ctx.body```进行返回前端，但是发现有些东西经常重复写，还不如提出来进行封装，而且还不用担心返回的格式会不一致。
先看看代码：

```
'use strict'

const { logger } = require('./logger')

// 这个middleware用于将ctx.result中的内容最终回传给客户端
const responseHandler = (ctx) => {
  if (ctx.result !== undefined) {
    ctx.type = 'json'
    ctx.body = {
      code: 200,
      msg: ctx.msg || '',
      data: ctx.result
    }
  }
}

// 这个middleware处理在其它middleware中出现的异常,我们在next()后面进行异常捕获，出现异常直接进入这个中间件进行处理
const errorHandler = (ctx, next) => {
  return next().catch(err => {
    if (err.code == null) {
      logger.error(err.stack)
    }
    ctx.body = {
      code: err.code || -1,
      data: null,
      msg: err.message.trim()
    }
    // 保证返回状态是 200
    ctx.status = 200 
    return Promise.resolve()
  })
}

module.exports = {
  responseHandler,
  errorHandler
}

```
代码的后面会暴露出```responseHandler```和```errorHandler```,```responseHandler```正确响应，我们在业务中，只需要对```ctx.result```进行写入即可。这个中间件可以放在所有中间件的最后面，这样可以保证前面中间件都需要经过它，再返回前端。```errorHandler```错误响应，这个主要是用来进行出错或者异常的捕获，可以返回响应给前端，要不前端会出现一直padding的状态直到超时。

##### 3、jwt.js

新建文件jwt.js, 大家先了解一下JWT是什么，流程是怎样的

JWT是什么：

>JWT的声明一般被用来在身份提供者和服务提供者间传递被认证的用户身份信息

JWT流程：

用户使用用户名密码来请求服务器

服务器进行验证用户的信息

服务器通过验证发送给用户一个token

客户端存储token，并在每次请求时附送上这个token值

服务端验证token值，并返回数据

了解完这个JWT后，在我们项目中，用了其实这个中间件是对```koa-jwt```和```jsonwebtoken```进行封装的，JWT我们用来生成token，用来判断用户的唯一性，每次登录后返回前端，前端每一个需要鉴权的api都需要进行token验证，我们利用了```koa-jwt```进行token的生成，但是怎样才能在每一个接口中获取到token解析后的用户呢。这个中间件就起到很大的关键作用。会结合在需要鉴权的```router```中，验证通过后保存信息到ctx中，可以供全局使用，完成了这个中间件后，怎样引用，我们在后面有进行说明。

记得安装```koa-jwt```和```jsonwebtoken```这两个插件，以下是jwt.js代码：
```
'use strict'

const koaJwt = require('koa-jwt')
const jwt = require('jsonwebtoken')
const config = require('../config')
const jwtMiddleware = koaJwt({ secret: config.secret })

module.exports = function (ctx, next) {
  // 将 token 中的数据解密后存到 ctx 中
  try {
    if (typeof ctx.request.headers.authorization === 'string') {
      const token = ctx.request.headers.authorization.slice(7)
      ctx.jwtData = jwt.verify(token, config.secret)
    } else {
      throw {code: 401, message: 'no authorization'}
    }
  } catch (err) {
    throw {code: 401, message: err.message}
  }
  next()
}

```

##### 4、cors.js文件

在前后端接口请求中，由于浏览器的限制，会出现跨域的情况。常用的跨域方案有：

1、JSONP跨域

2、nginx反向代理

3、服务器端修改heade

4、document.domain

5、window.name

6、postMessage

7、后台配置运行跨域

koa中如何设置跨域

先看看koa中如何设置跨域,cors具体的实现过程，具体的详细介绍，已经在代码中进行注释了。先看一下原生的配置，后面直接使用中间件即可，不过还是需要了解一下具体实现方式，万一出了问题，能快熟的排查。

```
app.use(async (ctx, next) => {
    // 允许来自所有域名请求
    ctx.set("Access-Control-Allow-Origin", "*");
    // 这样就能只允许 http://localhost:8080 这个域名的请求了
    // ctx.set("Access-Control-Allow-Origin", "http://localhost:8080"); 

    // 设置所允许的HTTP请求方法
    ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");

    // 字段是必需的。它也是一个逗号分隔的字符串，表明服务器支持的所有头信息字段.
    ctx.set("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type");

    // 服务器收到请求以后，检查了Origin、Access-Control-Request-Method和Access-Control-Request-Headers字段以后，确认允许跨源请求，就可以做出回应。

    // Content-Type表示具体请求中的媒体类型信息
    ctx.set("Content-Type", "application/json;charset=utf-8");

    // 该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。
    // 当设置成允许请求携带cookie时，需要保证"Access-Control-Allow-Origin"是服务器有的域名，而不能是"*";
    ctx.set("Access-Control-Allow-Credentials", true);

    // 该字段可选，用来指定本次预检请求的有效期，单位为秒。
    // 当请求方法是PUT或DELETE等特殊方法或者Content-Type字段的类型是application/json时，服务器会提前发送一次请求进行验证
    // 下面的的设置只本次验证的有效时间，即在该时间段内服务端可以不用进行验证
    ctx.set("Access-Control-Max-Age", 300);

    /*
    CORS请求时，XMLHttpRequest对象的getResponseHeader()方法只能拿到6个基本字段：
        Cache-Control、
        Content-Language、
        Content-Type、
        Expires、
        Last-Modified、
        Pragma。
    */
    // 需要获取其他字段时，使用Access-Control-Expose-Headers，
    // getResponseHeader('myData')可以返回我们所需的值
    //https://www.rails365.net/articles/cors-jin-jie-expose-headers-wu
    ctx.set("Access-Control-Expose-Headers", "myData");
    
    await next();
})

```
相对用得较多是的大神封装好得koa-cors中间件，可以自行查看npm上得文档，在这个项目中用的就是koa-cors的中间件，基本的配置写在cors.js里面了，再通过中间件进行引用。注意要写在router前面，避免在没有进行跨域配置前就去请求接口。

app.js中的引用，记得安装引入koa-cors
```
// cors
app.use(cors(corsHandler))
```

```
'use strict'

const corsHandler = {
    origin: function (ctx) {
        if (ctx.url === '/test') {
            // 这里可以配置不运行跨域的接口地址
            return false;
        }
        return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}


module.exports = {
    corsHandler
}

```
##### koa-helmet 中间件

koa-helmet 可以帮助你的 app 抵御一些比较常见的安全 web 安全隐患，它其实是将 9 个安全中间件集中到了一起，做了合并,大部分都是对于 http header 的操作，下图为默认开启的功能。

![](https://user-gold-cdn.xitu.io/2019/5/28/16afd8122ac63731?w=534&h=522&f=png&s=46436)

在项目中使用先安装该中间件， ``` npm i koa-helmet --save```,该项目中直接引用默认配置即可，如果有需要，可以看官方文档自己进行配置。关于koa更多的安全配置，大家可以参考这位大神的博客，https://cnodejs.org/topic/5a437fc18230827a18293afa

这个直接在我们app.js进行引用即可
```
const helmet = require("koa-helmet")

// Helmet
app.use(helmet())

```

##### 其他中间件

koa的中间件可以说很多大神给我们做好了轮子，我们直接可以拿来用就行，例如：```bodyParser```、```koa-session```、将将中间件转换成koa2可以使用的中间件```koa-convert```、EJS模板使用```koa-ejs```,大家根据自己需要进行引用，由于是基础模板，暂时没有加上过多中间件，减少体积。我们项目中还有用到```koa-bodyparser```、```koa-static-cache```，记得安装，并在app.js引入

#### 7、lib文件

这个文件夹主要是用来做存放工具类的文件夹，一些全局的工具处理文件可以放到这边来，目前这个项目中只有2个文件，新建```error.js```和```mongoDB.js```

```error.js```中主要是在中间件中抛出异常，由于前面我们已经加入了异常捕获的中间件，在中间件操作过程中，如果有错误，我们可以直接抛出异常，这个方法就是为了方便我们配置所用的。文件中的方法是```CodedError```方法继承了Error，```ForbiddenError```和```InvalidQueryError```是继承了```CodedError```，记得在使用的时候得实例化一下该构造函数。如果小伙伴对ES6的继承还不熟悉，可以先看一下文档再来看该工具类。
```
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

```
```mongoDB.js```文件是对mongoDB的链接配置，后续在models中会讲到。

#### 8、models文件

该项目中是使用```mongoose```对``mongoDB``对数据库进行操作，```mongoose```语法简单，需要过多的学习成本。按照官方文档的配置以及api操作，即可对```mongoBD```进行灵活性存储。```mongoose```的配置包括三大部分：```connect```、```Models```和```Schema```

```connect```：用于创建数据库连接及监听

```Schema```：Schema主要用于定义MongoDB中集合Collection里文档document的结构,可以理解为mongoose对表结构的定义(不仅仅可以定义文档的结构和属性，还可以定义文档的实例方法、静态模型方法、复合索引等)，每个schema会映射到mongodb中的一个collection，schema不具备操作数据库的能力，简单理解是对字段的定义，操作数据库必须按照这些字段进行，否在会报错。

```Models```： 　Model是由Schema编译而成的假想（fancy）构造器，具有抽象属性和行为。Model的每一个实例（instance）就是一个document，document可以保存到数据库和对数据库进行操作。简单说就是model是由schema生成的模型，可以对数据库的操作。

在我们项目中，我们把它全局集合在models文件中进行配置。```index.js```文件里面操作了```connect```、```Models```这两个步骤。新建index.js,安装```mongoose```，引入相关文件，复制以下代码：

```
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');    //引用mongoose模块
const config = require('../config')
const { logger } = require('../middlewares/logger')

let url = "mongodb://" + config.mongoDB.host + ":" + config.mongoDB.port + "/" + config.mongoDB.database;
var mongo = mongoose.createConnection(url); //创建一个数据库连接

let db = {
    mongoose: mongoose,
    mongo: mongo,
    models: {}
};
// 错误
mongo.on('error', function (err) {
    logger.error(new Error(err));
});
// 开启
mongo.once('open', function () {
    logger.info("mongo is opened");
});
// 整合models文件下的其他js文件
fs.readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    }).forEach(function (file) {
    var modelFile = require(path.join(__dirname, file));
    var schema = new mongoose.Schema(modelFile.schema);

    db.models[modelFile.name] = mongo.model(modelFile.name, schema, modelFile.name);
});
// 根据name选择model
db.getModel = function (name) {
    return this.models[name];
};

module.exports = db;


````
代码中的链接部分一看基本就明白了，可是```models```部分怎么看不出所以然。其实是模块化开发的一部分，这里是为了整合models文件下的其他js文件，方便开发者使用，不用每写一个文件就要进行引入和导出。

初始情况下，```models```引入只需```mongoose.model('名称', schema);``` 并将其暴露出去，即可对数据库进行操作。

```
fs.readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    }).forEach(function (file) {
    var modelFile = require(path.join(__dirname, file));
    var schema = new mongoose.Schema(modelFile.schema);

    db.models[modelFile.name] = mongo.model(modelFile.name, schema, modelFile.name);
});

```
在这个文件内，我们做了这样一件事：读取 models 目录下所有文件名不为 index.js 且以 .js 为后缀名的文件，使用 require 进行引用，并将其整合为一个 schema对象后再引入到models并且暴露出去给操作数据库。这样子做的好处是，在项目越来越庞大以后，如果我们需要添加新的 schema ，只需直接在 models 目录下新建 .js 文件即可，则不用再进行引入的关系操作

由于有了上一步的操作，我们后面直接新增一个schema的配置文件即可。index.js会自动的引入并暴露出model

```
'use strict'

module.exports = {
  name: "user",
  schema: {
    uuid: String, // UUID
    userName: String, // 用户名
    password: String, // 密码
  }
};

```

我们使用时可以这样操作，

```
const User = require('../models/index').getModel('user')
const user = await User.findOne({userName: userName})

```

#### 9、PM2配置

PM2是可以用于生产环境的Nodejs的进程管理工具，并且它内置一个负载均衡。它不仅可以保证服务不会中断一直在线，并且提供0秒reload功能，还有其他一系列进程管理、监控功能。并且使用起来非常简单。pm2的官方文档已经进行详细的配置说明，在这里就不进行一一简述，主要讲的时我的koa项目怎样配合PM2进行相关管理或者说部署。[PM2常用命令](https://www.jianshu.com/p/0099378d477e)需要用的时候可以进行查看，没必要去背，用多就熟悉了。也可以结合在package.json里面，用自定义命令运行。我们在```package.json```的```script```配置和初始化文件```ecosystem.config.js```进行了多环境运行的配置，我们可以根据需要进行切换环境。

```package.json```文件添加如下：
```
  "scripts": {
    "start": "node ./bin/www",
    "dev": "pm2 start ecosystem.config.js --env dev",
    "test": "pm2 start ecosystem.config.js --env test",
    "pro": "pm2 start ecosystem.config.js --env pro",
    "logs": "pm2 logs",
    "stop": "pm2 stop ecosystem.config.js"
  },
```
其中的

    npm run start: 直接跑www文件，可用于调试
    npm run dev: 开发环境
    npm run test：测试环境
    npm run pro：生产环境
    npm run logs: 查看pm2的日志
    npm run stop： 停止pm2服务
新增```ecosystem.config.js```文件：

```
module.exports = {
  apps : [{
    name: 'API',
    script: './bin/www',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: 'one two',
    instances: 1,
    autorestart: true,
    watch: true,
    ignore_watch: [                           // 不用监听的文件
      'node_modules',
      'logs'
    ],
    max_memory_restart: '1G',
    env_pro: {
      "NODE_ENV": "production",
      "REMOTE_ADDR": ""
    },
    env_dev: {
      "NODE_ENV": "development",
      "REMOTE_ADDR": ""
    },
    env_test: {
      "NODE_ENV": "test",
      "REMOTE_ADDR": ""
    }
  }]
};

```
这个文件主要是对pm2的基本配置，不用每次都进行配置，直接在文件进行改动即可。我们需要关注的是可以在```env```中，增加我们需要的环境及变量即可，文件中的```watch```属性是可以配置监听文件改动后，自动重启项目，比较好用。如果想忽略某一个文件夹的变动可以```ignore_watch```，更多的配置如果有兴趣的小伙伴可以查看官方文档的文档说明。

#### 10、路由配置

新建router文件，该目录下存放路由基本配置，新建```private```和```public```两个文件，安装```router```,在app.js引入路由后，
```
const publicRouter = require('./routes/public')
const privateRouter = require('./routes/private')
// Routes
app.use(publicRouter.routes(), publicRouter.allowedMethods())
app.use(privateRouter.routes(), privateRouter.allowedMethods())
```
每一个路由都必须暴露出去，这样在app.js文件中使用该中间件。```publicRouter.allowedMethods()```根据```ctx.status```设置```response```响应头

```private```：该文件下的路由是需要通过jwt验证的，才能进行访问。前面我们做了jwt的中间件，我们直接引入即可
```router.use(jwtMiddleware)```记得要放在请求路由的前面，才能保证每次都经过它。我们对其前缀做了处理，```router.prefix('/api')```在每一个请求的时候都需要带上这个前缀，抽出来也是为了服务目录的改变，可以直接更改即可，做了全局的操作
```
'use strict'

const Router = require('koa-router')
const controllers = require('../controllers')
const jwtMiddleware = require('../middlewares/jwt')

const router = new Router()
router.prefix('/api')
router.use(jwtMiddleware)

router.get('/test', controllers.test.test)

module.exports = router
```

```public```：该文件与上面相反，主要用来不进行登录的校验，也就是我们常用的登录、注册等不需要验证的接口。
```
'use strict'

const Router = require('koa-router')
const controllers = require('../controllers')

const router = new Router()
router.prefix('/api')

router.post('/login', controllers.login.login)

module.exports = router
```
为什么我们没在这里处理业务逻辑呢？其实这里是遵循了MVC的思想，进行了分离。把数据库的操作放到了controllers文件中。这如果我们接口一多，不会显示得特别混乱。下面我们就来讲这个文件。

#### 11、controllers文件

为了让整个项目更为模块化，该目录下主要是处理对应的路由的回调函数，一般我们不会在router文件中去业务逻辑操作等步骤，这里采用 routes 和 controller 分开，在方便代码的查看同时，也方便代码的维护和开发。

在controller新建index.js文件：

该文件与models中的index.js文件中的集合该目录下的文件类似,这里是将其他文件导出统一到index暴露出去。

```
'use strict'

const fs = require('fs')

const files = fs.readdirSync(__dirname).filter(file => file !== 'index.js')

const controllers = {}
for (const file of files) {
  if (file.toLowerCase().endsWith('js')) {
    const controller = require(`./${file}`)
    controllers[`${file.replace(/\.js/, '')}`] = controller
  }
}

module.exports = controllers

```
其他文件的编写可以按照下面基本框架进行,在这里会用到前面封装好的业务，例如操作、响应、jwt等操作。大家可以认真看以下代码分析一下。

新建user.js文件，这个文件就是我们处理业务的，我们可以按需添加

```
'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')
const userServices = require('../services').user
const { InvalidQueryError } = require('../lib/error')
const login = {}
login.login = async (ctx, next) => {
    console.log(userServices)
    const {userName, password} = ctx.request.body
    if (!userName || !password) {
        throw new InvalidQueryError()
    }
    const user = await userServices.login({
        userName: userName,
        password: password
    })
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


```
#### 11、services文件

新增services文件，这个文件主要是用来处理数据库以及服务等逻辑，我们进行了抽离，在该文件夹下面新建index.js,该文件内容还是与controllers文件中的用法一致，大家可参考上面的说明，只是部分字段需要改动，详细看下面代码：

```
'use strict'

const fs = require('fs')

const files = fs.readdirSync(__dirname).filter(file => file !== 'index.js')

const services = {}
for (const file of files) {
  if (file.toLowerCase().endsWith('js')) {
    const service = require(`./${file}`)
    services[`${file.replace(/\.js/, '')}`] = service
  }
}

module.exports = services

```

如果需要新建其他模块操作，可以在该新建例如：user.js文件，目前该文件是对数据库user的集合操作，示例如下：

```

const User = require('../models/index').getModel('user')

const user = {
    /**
     * @Description: 登录
     * @date 2019/5/30
     * @params: { Object } userData
     * @return: { Object | null }
     */
    async login (userData) {
        return await User.findOne(userData)
    }
}

module.exports = user


```



#### 12、config.js文件

根目录新建该文件主要用来存放全局的配置，如果一个项目中没有全局的配置，那么一个地方改动牵动的其他地方很多，这样很不利于工作效率，在开发过程中，我们一般会把常用的都放在这个文件，例如：数据库参数，端口，密钥，全局变量等。看自己的需求适当的更改。该文件将变量进行了暴露，引用时进行require即可。

```
'use strict'

const path = require('path')

module.exports = {
  port: '3001',
  secret: 'secret',
  publicDir: path.resolve(__dirname, './public'),
  logPath: path.resolve(__dirname, './logs/koa-template.log'),
  mongoDB: {
    database: 'mall',
    username: 'root',
    password: 'root',
    host: '127.0.0.1',
    port: 27017
  }
}

```

#### package.json文件

每个Nodejs项目的根目录下面，一般都会有一个package.json文件。该文件可以由npm init生成，我们再开始已经操作了，定义了项目所需要的各种模块，以及项目的配置信息（比如名称、版本、许可证等元数据）。
package.json文件内部就是一个JSON对象，该对象的每一个成员就是当前项目的一项设置。我们也可在里面配置我们的```npm run XXX```的命令，大家可以根据需求进行配置。这是这项目需要用到的package.json文件。看是否与你的跟该文件一样。
```
{
  "name": "koa-template",
  "version": "0.1.0",
  "author": "bayi",
  "private": true,
  "scripts": {
    "start": "node ./bin/www",
    "dev": "pm2 start ecosystem.config.js --env dev",
    "test": "pm2 start ecosystem.config.js --env test",
    "pro": "pm2 start ecosystem.config.js --env pro",
    "logs": "pm2 logs",
    "stop": "pm2 stop ecosystem.config.js"
  },
  "dependencies": {
    "koa": "^2.6.2",
    "koa-bodyparser": "^4.2.1",
    "koa-helmet": "^4.1.0",
    "koa-jwt": "^3.5.1",
    "koa-router": "^7.4.0",
    "koa-static-cache": "^5.1.2",
    "koa2-cors": "^2.0.6",
    "log4js": "^3.0.6",
    "mongoose": "^5.5.5"
  }
}

```

### 三、其他

####github地址： 

https://github.com/bayi-lzp/koa-template    （star！ star！star！）

####技术栈： 

koa2、mongoose

####近期会更新：

redis、docker
