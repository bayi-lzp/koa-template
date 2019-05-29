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
    error_file: "./logs/app-err.log",         // 错误日志文件
    out_file: "./logs/app-out.log",           // 正常日志文件
    log_date_format: "YYYY-MM-DD HH:mm:ss",
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
