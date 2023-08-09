const idTranslator = require("./IdTranslator");

module.exports = (socket)=>{
    console.log(socket.userDate.userId + "连接服务器了");
    socket.on("disconnect", (reason) => {
        console.log("用户断开");
    });
    const idMapping  = new idTranslator();
    idMapping.addMapping(socket.id,socket.userDate.userId);
    console.log(idMapping.getId(socket.id))
    console.log(idMapping.getId(socket.userDate.userId.toString()));
    socket.emit("success","连接成功");
}
