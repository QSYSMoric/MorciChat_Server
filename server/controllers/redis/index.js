const redis = require("redis");
//配置选项
const redisOptions = {
    url: 'redis://127.0.0.1',
    port: 6379,
};
//初始化
const redisClient = redis.createClient(redisOptions);
//准备完毕开始连接
redisClient.connect();
//订阅失败消息
redisClient.on('error', err => {
    console.log('Redis client error: ', err);
});
//订阅连接成功消息
redisClient.on('ready', () => {
    console.log('redis连接成功');
});

module.exports = redisClient;