const OnlineUsersTable = require("./onlineUsersControllers");
const day = require("../../../plugins/day");
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
exports.sendMessage = function(socket,chatMsg){
    chatMsg.senderId = socket.userDate.userId;
    chatMsg.timing = day.nowTime();
    chatMsg.dynamic_id = Number(chatMsg.dynamic_id)
    socket.to(chatMsg.dynamic_id).emit("channelMessages",chatMsg);
    socket.emit("channelMessages",chatMsg);
}



//用户断开连接操作
exports.disconnect = function(userId){
    onlineUsers.deleteUser(userId);
}