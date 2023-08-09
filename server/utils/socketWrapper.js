const { Server } = require('socket.io');
const { checkTokenMiddlewareSocket } = require("../utils/userAuthentication");
const socketIO = require("../controllers/socketIOControllers/index");
let onlySocket = null;

// 将Socket.io封装在一个函数中，并应用单例模式
function wrapSocketIO(httpServer) {
  if (!onlySocket) { // 检查实例是否已存在
    onlySocket = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ['GET', 'POST'],
      },
    });
    onlySocket.use(checkTokenMiddlewareSocket);
    // 连接入口
    onlySocket.on('connection',socketIO);
  }

  return onlySocket;
}

module.exports = wrapSocketIO;