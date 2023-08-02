const MoricSocialPlatform_friends = require("../controllers/databasesControllers/MoricSocialPlatform_friends");
const nowTime = require("../../plugins/day");
module.exports = {
    //注册中的额外操作
    async RegisterAdditionalActions(userId){
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
            const insertIntoFriend = MoricSocialPlatform_friends.insertIntoFriend(inseretInToGroupChat,[userId,90000,timeing,"90000","confirmed"]);
            insertIntoFriend.then((data)=>{
                console.log(data);
            }).catch((err)=>{
                console.log(err);
            });
        }).catch((err)=>{
            console.log(err);
        });
        return Promise.resolve(console.log("操作结束"));
    }
}