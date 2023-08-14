const OnlineUsersTable = require("../onlineUsersControllers");

//创建在线用户表
const onlineUsers = new OnlineUsersTable("onlineUsers");
onlineUsers.clearUserList();
module.exports = (socket)=>{
    // onlineUsers.addUser(socket.userDate);
    // onlineUsers.getUserList().then((data)=>{
    //     console.log(data);
    // });
    socket.on("disconnect", (reason) => {
        console.log("用户断开");
    });
}
