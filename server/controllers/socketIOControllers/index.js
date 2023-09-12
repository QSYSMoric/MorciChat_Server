const OnlineUsersTable = require("./onlineUsersControllers");

//创建在线用户表
const onlineUsers = new OnlineUsersTable("onlineUsers");
//项目初始化先清除在线列表
onlineUsers.clearUserList();
module.exports = (socket)=>{
    //用户进入到自己的房间
    socket.join(socket.userDate.userId);
    //用户连接到服务器后添加到在线列表
    onlineUsers.addUser(socket.userDate.userId);
    //获取用户在线列表
    onlineUsers.getUserList().then((data)=>{

    });

    //用户断开与服务器的连接后删除这个用户
    socket.on("disconnect", (reason) => {
        console.log("用户断开");
    });
}
