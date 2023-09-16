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

//用户断开连接操作
exports.disconnect = function(userId){
    onlineUsers.deleteUser(userId);
}