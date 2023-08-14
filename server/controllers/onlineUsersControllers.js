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

class OnlineUsersTable {
    //创建列表
    constructor(name) {
        this.Setname = name;
    }
    //添加用户到在线列表
    async addUser(user) {
        try {
            await redisClient.sAdd(this.Setname,JSON.stringify(user));
        } catch (err) {
            console.log(err);
            return err;
        }
    }
    //删除指定用户
    async deleteUser(user) {
        try {
            await redisClient.sRem(this.Setname,JSON.stringify(user));
        } catch (err) {
            console.log(err.message);
            return err;
        }
    }
    //获取在线用户列表
    async getUserList(){
        try{
            let userList = redisClient.sMembers(this.Setname);
            return Promise.resolve(userList);
        }catch(err){
            console.log(err.message);
            return err; 
        }
    }
    //清除用户列表
    async clearUserList(){
        try{
            redisClient.del(this.Setname)
        }catch(err){
            console.log(err.message);
            return err; 
        }        
    }
}

module.exports = OnlineUsersTable;