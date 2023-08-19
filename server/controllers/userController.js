//处理模块
const userAuthentication = require("../utils/userAuthentication");
const day = require("../../plugins/day");
const Moric_users = require("../controllers/databasesControllers/MoricSocialPlatform_users");
const Moric_Friendcircle = require("../controllers/databasesControllers/MoricSocialPlatForm_friendcircle");
const MoricSocialPlatForm_comments = require("../controllers/databasesControllers/MoricSocialPlatForm_comments");
const imageProcessing = require("../utils/imageProcessing");
const userAdditionalOperations = require("../additionalOperations/userAdditionalOperations");
const ResponseObj = require("../../plugins/responseMessage");
const Moric_Moments = require("../class/Moric_Moments");
const Moric_UserInfo = require("../class/Moric_UserInfo");
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
            throw new Error("查询失败");
        }
        const { userMsg } = data;
        //密码错误操作
        if (userMsg.userPassword != userPassword) {
            return res.json(new ResponseObj(2000, false, "登录失败"));
        }
        res.cookie("isLoggedin", true);
        const token = userAuthentication.createToken({ userId:userMsg.userId });
        return res.json(new ResponseObj(1000, true, "登录成功", {token}));
    } catch (err) {
        // 处理错误
        console.error(err);
        return res.json(new ResponseObj(2000, false, "登录失败"));
    }
};
//个人信息处理
exports.getUserInformation = async function(req,res){
    try{
        const { userId } = req.userDate;
        let selectSql = "SELECT userId,userName,userProfile,userProfileType,userEmail,userAge,userSignature FROM users WHERE userId = ? "
        const data = await Moric_users.selectUser(selectSql, [userId]);
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
        console.log(err.message);
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
        }
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
        console.log(err.message);
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
                friendCirclePictures = JSON.parse(friendCirclePictures)
                friendCirclePictures.forEach((element,index)=>{
                    friendCirclePictures[index] = imageProcessing.binaryToBase64(element.data);
                });
                element.friendCirclePictures = friendCirclePictures;
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
//获取用户信息
exports.pickInformation = async function(req,res){
    try {
        const { userId } = req.body;
        let sql = "SELECT userId, userName, userProfile, userProfileType, userEmail, userAge, userSignature FROM users WHERE userId = ?;"
        const data = Moric_users.selectUser(sql,[userId]);
        data.then((data)=>{
            const { userMsg } = data;
            let userInfo = new Moric_UserInfo(userMsg.userId,userMsg.userName,userMsg.userProfile,userMsg.userProfileType,userMsg.userEmail,userMsg.userAge,userMsg.userSignature);
            return res.json(new ResponseObj(1000, true, "成功",userInfo));
        }).catch((err)=>{
            throw new Error(err.message);
        });
    } catch (error) {
        // 处理错误
        console.log("pickInformationErr:"+error.message);
        return res.json(new ResponseObj(2000, false, error.message));
    }
}