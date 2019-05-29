const mongoose = require('mongoose');
const config = require('../config')
const url = "mongodb://" + config.mongoDB.host + ":" + config.mongoDB.port + "/" + config.mongoDB.database;

const connectDB = () => {

    mongoose.connect(url); //创建一个数据库连接

    mongoose.connection.on('connected', function () {
        console.log(`${url} Connecting database successfully`);
    })

    mongoose.connection.on('error', function () {
        console.log(`${url} Failed to connect to database`);
    })

    mongoose.connection.on('disconnected', function () {
        console.log(`${url} Closed to connect to database`);
    })
}
module.exports = connectDB
