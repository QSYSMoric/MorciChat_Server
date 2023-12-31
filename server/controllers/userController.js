//处理模块
const userAuthentication = require("../utils/userAuthentication");
const day = require("../../plugins/day");
const Moric_users = require("../controllers/databasesControllers/MoricSocialPlatform_users");
const Moric_Friendcircle = require("../controllers/databasesControllers/MoricSocialPlatForm_friendcircle");
const Moric_Historychatlog = require("../controllers/databasesControllers/MoricSocialPlatForm_historyChatLog");
const MoricSocialPlatform_friends = require("../controllers/databasesControllers/MoricSocialPlatform_friends");
const MoricSocialPlatForm_comments = require("../controllers/databasesControllers/MoricSocialPlatForm_comments");
const imageProcessing = require("../utils/imageProcessing");
const userAdditionalOperations = require("../additionalOperations/userAdditionalOperations");
const ResponseObj = require("../../plugins/responseMessage");
const Moric_Moments = require("../class/Moric_Moments");
const Moric_UserInfo = require("../class/Moric_UserInfo");
const Moric_Comment = require("../class/Moric_Comment");
//注册处理
exports.createUser = async function(req,res){
    let { userName,userEmail,userPassword,userProfile,userProfileType } = req.body;
    //先验证邮箱是否被注册
    let sql = "SELECT userId FROM users WHERE userEmail = ? ";
    await Moric_users.selectUser(sql,[userEmail]).then(async (data)=>{
        if(data.state){
            //查到了有重名
            return res.json({
                code:"2000",
                state:false,
                alertMsg:"注册失败:邮箱已被注册",
                body:null
            });
        }
        //如果用户有头像
        if(userProfile) {
            userProfile = imageProcessing.base64ToBinary(userProfile);
        }
        const timing = day.nowTime();
        const insertSql = "INSERT INTO `users` (userName, userEmail, userPassword, userProfile, userProfileType, userCreateAt) VALUES (?, ?, ?, ?, ?, ?);"
        const createUserPromise = Moric_users.createUser(insertSql,[userName,userEmail,userPassword,userProfile,userProfileType,timing]);
        await createUserPromise.then((data)=>{
            //设置cookie为登录状态
            res.cookie("isLoggedin",true);
            const { userMsg } = data;
            //注册的额外操作
            userAdditionalOperations.registerAdditionalActions(userMsg.insertId);
            const token = userAuthentication.createToken({userId:userMsg.insertId});
            return res.json({
                code:1000,
                alertMsg:'注册成功',
                state:true,
                body:{
                    token,
                    userId:userMsg.insertId
                }
            });
        }).catch(err=>{
            return res.json({
                code:3100,
                state:false,
                alertMsg:err.alert,
                body:null
            });
        });
    }).catch(err=>{
        //数据库出错
        return res.json({
            code:3100,
            state:false,
            alertMsg:err.alert,
            body:null
        });
    });
};
//登录处理
exports.loginUser = async function(req,res) {
    try {
        let { userId, userPassword } = req.body;
        let loginQuery = null;
        if (userId.includes('@')) {
            loginQuery = "SELECT userPassword,userId FROM users WHERE userEmail = ? ";
        } else {
            loginQuery = "SELECT userPassword,userId FROM users WHERE userId = ? ";
        }
        const data = await Moric_users.selectUser(loginQuery, [userId]);
        if (!data.state) {
            console.log("查询失败");
            throw new Error("账户不存在");
        }
        const { userMsg } = data;
        //密码错误操作
        if (userMsg.userPassword != userPassword) {
            throw new Error("密码错误");
        }
        res.cookie("isLoggedin", true);
        const token = userAuthentication.createToken({ userId:userMsg.userId });
        return res.json(new ResponseObj(1000, true, "登录成功", {token}));
    } catch (err) {
        // 处理错误
        console.error("loginUser:"+err.message);
        return res.json(new ResponseObj(2000, false, err.message));
    }
};
//个人信息处理
exports.getUserInformation = async function(req,res){
    try{
        const { userId } = req.userDate;
        let selectSql = "SELECT userId,userName,userProfile,userProfileType,userEmail,userAge,userSignature FROM users WHERE userId = ? "
        const data = await Moric_users.selectUser(selectSql, [userId])
        if (!data.state) {
            throw new Error("查询失败服务器出错");
        }
        const { userMsg } = data;
        if(userMsg.userProfile){
            userMsg.userProfile = imageProcessing.binaryToBase64(userMsg.userProfile);
        }
        return res.json(new ResponseObj(1000,true,"获取成功",userMsg));
    }catch (err) {
        // 处理错误
        console.log("getUserInformation出错："+ err.message);
        return res.json(new ResponseObj(2000, false, err.message));
    }
};
//用户发布社区动态
exports.publishMoments = async function(req,res){
    try{
        const { friendCircleImg,friendCircleCopy } = req.body;
        if(friendCircleImg.length){
            friendCircleImg.forEach((element,index)=>{
                friendCircleImg[index] = imageProcessing.base64ToBinary(element);
            });
        };
        //构建朋友圈对象
        let commentsObj = new Moric_Moments(req.userDate.userId,day.nowTime(),friendCircleCopy,friendCircleImg);
        let sql = "INSERT INTO `friend_circle` (publisher, publicTiming, friendCircleCopy, friendCirclePictures ) VALUES (?, ?, ?, ?);";
        //插入朋友圈
        Moric_Friendcircle.createFriendcircle(sql,[commentsObj.publisherId,commentsObj.publishTiming,commentsObj.friendCircleCopy,JSON.stringify(commentsObj.friendCircleImg)]).then((data)=>{
            //为动态安装评论区
            commentsObj.setMomentsId(data.body.insertId);
            MoricSocialPlatForm_comments.createComment(data.body.insertId).then((data)=>{
                commentsObj.setCommentformationId(data.body.id);
                Moric_Friendcircle.installationComment(commentsObj.publishId,commentsObj.commentformationId).then(()=>{
                    //释放内存
                    userAdditionalOperations.publishMomentsAdditionalActions(commentsObj);
                    commentsObj = null;
                    return res.json(new ResponseObj(1000,true,"发布成功"));
                }).catch((err)=>{
                    throw new Error(err);
                });
            }).catch((err)=>{
                throw new Error(err);
            });
        }).catch((err)=>{
            throw new Error(err);
        });
    }catch(err){
        console.log("publishMoments出错:" + err.message);
        return res.json(new ResponseObj(2000,false,"发生了意料之外的错误"),err.message);
    }
}
//获取最新的10条数据
exports.getNewMoments = async function(req,res){
    try{
        let { timing } = req.body;
        if(!timing){
            timing = day.nowTime();
        }
        Moric_Friendcircle.pagingCommentList(timing).then((data)=>{
            data.body.forEach((element)=>{
                let { friendCirclePictures } = element;
                if(friendCirclePictures && friendCirclePictures.length){
                    friendCirclePictures = JSON.parse(friendCirclePictures)
                    friendCirclePictures.forEach((element,index)=>{
                        friendCirclePictures[index] = imageProcessing.binaryToBase64(element.data);
                    });
                    element.friendCirclePictures = friendCirclePictures;
                }
            });
            return res.json(new ResponseObj(1000,true,"请求成功",data.body));
        }).catch((err)=>{
            throw err;
        });
    }catch(err){
        console.log("getNewMoments出错:" + err.message);
        return res.json(new ResponseObj(2000,false,"发生了意料之外的错误"),err.message); 
    }
}
//获取本用户的信息
exports.getMomentsMy = async function(req,res){
    try {
        const { userDate } = req;
        Moric_Friendcircle.getMomentsMy(userDate.userId).then((data)=>{
            data.body.forEach((element)=>{
                let { friendCirclePictures } = element;
                if(friendCirclePictures && friendCirclePictures.length){
                    friendCirclePictures = JSON.parse(friendCirclePictures)
                    friendCirclePictures.forEach((element,index)=>{
                        friendCirclePictures[index] = imageProcessing.binaryToBase64(element.data);
                    });
                    element.friendCirclePictures = friendCirclePictures;
                }
            });
            return res.json(new ResponseObj(1000,true,"请求成功",data.body));
        }).catch((err)=>{
            throw err;
        });
    } catch (error) {
        console.log("getMomentsMy出错:" + error.message);
        return res.json(new ResponseObj(2000,false,"发生了意料之外的错误"),error.message);         
    }
}
//获取用户信息
exports.pickInformation = async function(req,res){
    try {
        const { userId } = req.body;
        if(!userId){
            console.log("userId出错:"+userId);
            throw new Error("userId为空");
        }
        let sql = "SELECT userId, userName, userProfile, userProfileType, userEmail, userAge, userSignature, userCreateAt FROM users WHERE userId = ?;"
        const data = await Moric_users.selectUser(sql,[userId]);
        if(!data.state){
            throw new Error("没有找到该用户");
        }
        const { userMsg } = data;
        let userInfo = new Moric_UserInfo(userMsg.userId,userMsg.userName,userMsg.userProfile,userMsg.userProfileType,userMsg.userEmail,userMsg.userAge,userMsg.userSignature);
        return res.json(new ResponseObj(1000, true, "成功",userInfo));
    } catch (error) {
        // 处理错误Qh*ApnDdS4Vi
        console.log("pickInformationErr:" + error);
        return res.json(new ResponseObj(2000, false, "没有该用户",error));
    }
}
//获取评论列表
exports.getComments = async function(req,res){
    const { momentId } = req.body;
    try {
        const dataInfo = await MoricSocialPlatForm_comments.getCommentsById(momentId);
        if(!dataInfo.state){
            throw new Error(dataInfo.alertMsg);
        }
        return res.json(dataInfo);
    } catch (error) {
        return res.json(new ResponseObj(2000, false, error.message));    
    }
}
//用户发布评论
exports.setComments = async function(req,res){
    const { comment } = req.body;
    const commentsObj = new Moric_Comment(comment.user_id,day.nowTime(),comment.text_content,comment.comment_img,comment.dynamic_id);
    try {
        const dataInfo = await MoricSocialPlatForm_comments.postCommentsToMoment(commentsObj);
        if(!dataInfo.state){
            throw new Error(dataInfo.alertMsg);
        }
        userAdditionalOperations.publishCommentsAdditionalActions(commentsObj);
        return res.json(new ResponseObj(1000,true,"发表成功",{}));
    } catch (error) {
        console.log("setCommentsErr:",error.message);
        return res.json(new ResponseObj(3100,false,"发布成功",error.message));
    }
}
//获取聊天记录
exports.getChatRecords = async function(req,res){
    try {
        const { chatId } = req.body;
        if(!chatId){
            throw new Error("chatId为空");
        }
        const dataInfo = await Moric_Historychatlog.getChatHistoryRecords(chatId);
        if(!dataInfo.state){
            throw new Error(dataInfo.alertMsg);
        }
        return res.json(new ResponseObj(1000,true,"获取聊天记录成功",dataInfo.body));
    } catch (error) {
        console.log(error);
        return res.json(new ResponseObj(3100,false,"获取聊天记录失败",error.message));
    }
}
//获取好友列表
exports.getFriendList = async function(req,res){
    const { userDate } = req;   
    try {
        const dataInfo = await MoricSocialPlatform_friends.getFriendList(userDate.userId);
        if(!dataInfo.state){
            throw new Error(dataInfo.alertMsg);
        }    
        return res.json(new ResponseObj(1000,true,"获取好友成功",dataInfo.body));
    } catch (error) {
        console.log("getFriendList:" + error.message);
        return res.json(new ResponseObj(3100,false,"获取好友失败",error.message));
    };
}
//更新用户与好友最后一次联系的时间
exports.updateLastContactTime = async function(req,res){
    const { userDate } = req;
    const { friendId } = req.body;
    try {
        const dataInfo = await MoricSocialPlatform_friends.isItFriend(userDate.userId,friendId);
        if(!dataInfo.state){
            throw Error(dataInfo.alertMsg);
        }
        //如果为好友关系
        if(dataInfo.body[0].friendStatus === "confirmed"){
            const databaseInfo = await MoricSocialPlatform_friends.updateLastContactTime(userDate.userId,friendId);
            if(!dataInfo.state){
                throw Error(dataInfo.alertMsg);
            }
            return res.json(new ResponseObj(1000,true,"成功",databaseInfo.body));
        }
    } catch (error) {
        console.log("updateLastContactTime:" + error);
        return res.json(new ResponseObj(3100,false,error.message,{lastContacttime:day.nowTime()}));
    }
}
//获取好友申请列表
exports.getFriendApplicationList = async function(req,res){
    try {
        const { userDate } = req;
        const sql = "SELECT userId, friendId, status, illustrate FROM operation WHERE (userId = ? OR friendId = ?) && status = 'Pending' ";
        const dataInfo = await Moric_users.preAddFriends(sql,[userDate.userId,userDate.userId]);
        if(!dataInfo.state){
            throw new Error("获取失败");
        }
        return res.json(new ResponseObj(1000,true,"成功",dataInfo.body));
    } catch (error) {
        console.log("getFriendApplicationList" + error.message);
        return res.json(new ResponseObj(3100,false,"获取失败"));
    }
}
//处理更改个人信息
exports.changePersonalInformation = async function(req,res){
    try {
        const { userDate } = req;
        const { selfMsg } = req.body;
        //先转头像格式
        //如果用户有头像
        if(selfMsg.userProfile) {
            selfMsg.userProfile = imageProcessing.base64ToBinary(selfMsg.userProfile);
        }
        const entries = Object.entries(selfMsg);
        entries.forEach(async (element)=>{
            if(element[1]){
                let sql = `UPDATE users SET ${element[0]} = ? WHERE userId = ${userDate.userId};`;
                let userInfo = await Moric_users.updataUserMsg(sql,[element[1]]);
                console.log(userInfo);
                if(!userInfo.state){
                    throw new Error("更改失败");
                }
            }
        });
        return res.json(new ResponseObj(1000,true,"更改成功"));
    } catch (error) {
        return res.json(new ResponseObj(3100,false,"更改失败"));
    }
}