//初始化
const redisClient = require("../redis/index");

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
            let userList = await redisClient.sMembers(this.Setname);
            userList.forEach((element,index)=>{
                userList[index] = JSON.parse(element);
            });
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