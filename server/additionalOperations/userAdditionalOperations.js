const MoricSocialPlatform_friends = require("../controllers/databasesControllers/MoricSocialPlatform_friends");
const nowTime = require("../../plugins/day");
const sortAndJoin = require("../utils/sortAndJoin");
//全局socket
const io = global.io;

module.exports = {
    //注册中的额外操作
    async registerAdditionalActions(userId){
        //创建独属于它的表
        let createFriendListSql = `CREATE TABLE ${userId}FriendList (
            id INT NOT NULL AUTO_INCREMENT,
            userId INT NOT NULL,
            friendId INT NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            remark VARCHAR(255),
            friendStatus ENUM('pending', 'confirmed', 'removed') DEFAULT 'pending',
            chatHistory VARCHAR(255),
            PRIMARY KEY (id)
        );`;
        const operationResults = MoricSocialPlatform_friends.createFriendTable(createFriendListSql);
        await operationResults.then((data)=>{
            //创建成功后将他加入到群聊频道中
            const timeing = nowTime.nowTime();
            let inseretInToGroupChat = `
                INSERT INTO ${userId}FriendList (userId,friendId,createdAt,chatHistory,friendStatus) VALUES (?,?,?,?,?);
            `;
            const chatHistoryId = sortAndJoin(userId,90000);
            const insertIntoFriend = MoricSocialPlatform_friends.insertIntoFriend(inseretInToGroupChat,[userId,90000,timeing,chatHistoryId,"confirmed"]);
            insertIntoFriend.then((data)=>{
                console.log(data);
            }).catch((err)=>{
                console.log(err);
            });
        }).catch((err)=>{
            console.log(err);
        });
        return Promise.resolve(console.log("操作结束"));
    },
    //发布动态的时候额外操作
    async publishMomentsAdditionalActions(newMoment){
        io.emit("newMoment", newMoment);
    },
    //发表评论的时候的额外操作
    async publishCommentsAdditionalActions(newComment){
        io.emit("newComment", newComment);
    }
}