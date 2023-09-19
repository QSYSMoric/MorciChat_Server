const OnlineUsersTable = require("./onlineUsersControllers");
const day = require("../../../plugins/day");
const Moric_users = require("../databasesControllers/MoricSocialPlatform_users");
const ResponseObj = require("../../../plugins/responseMessage");
//创建在线用户表
const onlineUsers = new OnlineUsersTable("onlineUsers");
//项目初始化先清除在线列表
onlineUsers.clearUserList();
//初始化
exports.start = function(userId){
    //用户连接到服务器后添加到在线列表
    onlineUsers.addUser(userId);
};

//用户发送消息
exports.groupChatMessages = function(socket,chatMsg){
    chatMsg.senderId = socket.userDate.userId;
    chatMsg.timing = day.nowTime();
    chatMsg.dynamic_id = Number(chatMsg.dynamic_id);
    socket.to(chatMsg.dynamic_id).emit("groupChatMessages",chatMsg);
    socket.emit("groupChatMessages",chatMsg);
    console.log(`${chatMsg.senderId}发送给${chatMsg.dynamic_id}`);
}

//私信消息
exports.privateMessage = function(socket,chatMsg){
    chatMsg.senderId = socket.userDate.userId;
    chatMsg.timing = day.nowTime();
    chatMsg.dynamic_id = Number(chatMsg.dynamic_id);
    socket.to(chatMsg.dynamic_id).emit("privateMessage",chatMsg);
    socket.emit("privateMessage",chatMsg);
    console.log(`${chatMsg.senderId}发送给${chatMsg.dynamic_id}`);
}

//处理添加好友操作
exports.addNewFiendToServe = async function(socket,friendId){
    try {
        if(!friendId){
           return socket.emit("addNewFiendToServe",new ResponseObj(2000,false,"参数为空"));
        }
        const { userId } = socket.userDate;
        const premiseSql = "SELECT COUNT(id) AS total FROM operation WHERE userId = ? AND friendId = ?;";
        const sql = "INSERT INTO operation (userId, friendId, illustrate) VALUES (?, ?, ?);";
        let premiseDataInfo = await Moric_users.preAddFriends(premiseSql,[userId,friendId]);
        if(premiseDataInfo.body[0].total){
            return socket.emit("addNewFiendToServe",new ResponseObj(3000,false,"你已经发送好友请求"));
        }
        let dataInfo = await Moric_users.preAddFriends(sql,[userId,friendId,"addFriend"]);
        if(!dataInfo.state){
            return socket.emit("addNewFiendToServe",new ResponseObj(3100,false,"添加好友失败"));
        }

        return socket.emit("addNewFiendToServe",new ResponseObj(1000,true,"已发送请求"));
    } catch (error) {
        
    }
}

//用户断开连接操作
exports.disconnect = function(userId){
    onlineUsers.deleteUser(userId);
}