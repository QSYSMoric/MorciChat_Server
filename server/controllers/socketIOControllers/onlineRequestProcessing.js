const OnlineUsersTable = require("./onlineUsersControllers");
const day = require("../../../plugins/day");
const Moric_users = require("../databasesControllers/MoricSocialPlatform_users");
const ResponseObj = require("../../../plugins/responseMessage");
const MoricSocialPlatform_friends = require("../databasesControllers/MoricSocialPlatform_friends");
const Moric_FriendOperation = require("../../class/Moric_FriendOperation");
const Moric_Historychatlog = require("../databasesControllers/MoricSocialPlatForm_historyChatLog");
const sortAndJoin = require("../../utils/sortAndJoin");
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
        //构造好友请求对象
        let friendRequest = new Moric_FriendOperation(userId,friendId);
        const premiseSql = "SELECT COUNT(id) AS total FROM operation WHERE userId = ? AND friendId = ?;";
        const sql = "INSERT INTO operation (userId, friendId, illustrate) VALUES (?, ?, ?);";
        let premiseDataInfo = await Moric_users.preAddFriends(premiseSql,[friendRequest.userId,friendRequest.friendId]);
        if(premiseDataInfo.body[0].total){
            return socket.emit("addNewFiendToServe",new ResponseObj(3000,false,"你已经发送好友请求"));
        }
        let dataInfo = await Moric_users.preAddFriends(sql,[friendRequest.userId,friendRequest.friendId,friendRequest.illustrate]);
        if(!dataInfo.state){
            return socket.emit("addNewFiendToServe",new ResponseObj(3100,false,"添加好友失败"));
        }
        //若用户在线发送好友请求至对方邮箱
        socket.to(friendId).emit("friendRequest",friendRequest);
        socket.emit("friendRequest",friendRequest);
        //操作状态
        return socket.emit("addNewFiendToServe",new ResponseObj(1000,true,"已发送请求"));
    } catch (error) {
        console.log("addNewFiendToServe" + error);
    }
}

//处理用户对这个用户的操作
exports.operateFriendRequests = async function(socket,friendOperation){
    try {
        if( !friendOperation.userId || !friendOperation.friendId){
            throw new Error("参数不对");
        }
        //先查看对方是否为自己的好友
        const premiseSql = "SELECT COUNT(id) AS total FROM operation WHERE userId = ? AND friendId = ? AND status = 'Approved';";
        let premiseDataInfo = await Moric_users.preAddFriends(premiseSql,[friendOperation.userId,friendOperation.friendId]);
        if(premiseDataInfo.body[0].total){
            return socket.emit("operateFriendRequests",new ResponseObj(2000,false,"对方已经是你的好友"));
        }
        if(friendOperation.status == "Rejected"){
            //用户拒绝好友请求
            let rejectedSql = `
                DELETE FROM operation
                WHERE userId = ? AND friendId = ?;` 
            let rejectInfo = await Moric_users.preAddFriends(rejectedSql,[friendOperation.userId,friendOperation.friendId]);
            if(!rejectInfo){
                throw new Error(rejectInfo);
            }
            return socket.emit("operateFriendRequests",new ResponseObj(1000,true,"拒绝成功"));
        }else{
            //构建历史聊天仓库
            const chatHistoryId = sortAndJoin(friendOperation.userId,friendOperation.friendId);
            //获取现在的时间
            const timeing = day.nowTime();
            //同意好友请求
            let userApproved = `INSERT INTO ${friendOperation.userId}FriendList (userId,friendId,createdAt,chatHistory,friendStatus,lastContacttime) VALUES (?,?,?,?,?,?);`;
            let toUserApproved = `INSERT INTO ${friendOperation.friendId}FriendList (userId,friendId,createdAt,chatHistory,friendStatus,lastContacttime) VALUES (?,?,?,?,?,?);`;
            //添加到双方的好友列表中
            let approved = Promise.all([
                MoricSocialPlatform_friends.insertIntoFriend(userApproved,[friendOperation.userId,friendOperation.friendId,timeing,chatHistoryId,"confirmed",timeing]),
                MoricSocialPlatform_friends.insertIntoFriend(toUserApproved,[friendOperation.friendId,friendOperation.userId,timeing,chatHistoryId,"confirmed",timeing]),
            ]);
            approved.then(async ()=>{
                //添加好友成功后创建历史聊天记录将申请列表改为通过状态
                const approvedSql = "UPDATE operation SET status = 'Approved' WHERE userId = ? AND friendId = ?;";
                Moric_users.preAddFriends(approvedSql,[friendOperation.userId,friendOperation.friendId]);
                Moric_Historychatlog.craeteChatHistory(chatHistoryId);
                console.log(friendOperation.userId)
                socket.to(friendOperation.userId).emit("friendsThrough",friendOperation);
                return socket.emit("operateFriendRequests",friendOperation);
            }).catch((err)=>{
                return socket.emit("operateFriendRequests",err);
            });
        }
    } catch (error) {
        console.log("operateFriendRequests：" + error.message);
    }
}

//用户断开连接操作
exports.disconnect = function(userId){
    onlineUsers.deleteUser(userId);
}