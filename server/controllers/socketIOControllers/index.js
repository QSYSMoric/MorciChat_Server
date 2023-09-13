const onlineRequestProcessing = require("./onlineRequestProcessing");
const publicChatRoom = 90000

module.exports = (socket)=>{
    //初始化操作
    onlineRequestProcessing.start(socket.userDate.userId);
    //用户进入到自己的房间
    socket.join(socket.userDate.userId);
    //用户加入公共频道
    socket.join(publicChatRoom);
    //处理用户发送的消息
    socket.on("sendMessage",(chatMsg)=>{
        onlineRequestProcessing.sendMessage(socket,chatMsg);
    });

    //用户断开与服务器的连接后删除这个用户
    socket.on("disconnect",() => {
        onlineRequestProcessing.disconnect(socket.userDate.userId);
        console.log(`用户${socket.userDate.userId}断开`);
    });
}
