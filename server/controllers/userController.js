//处理模块
const userAuthentication = require("../utils/userAuthentication");
const day = require("../../plugins/day");
const Moric_users = require("../controllers/databasesControllers/MoricSocialPlatform_users");
const imageProcessing = require("../utils/imageProcessing");
const userAdditionalOperations = require("../additionalOperations/userAdditionalOperations");
const ResponseObj = require("../../plugins/responseMessage");
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
        createUserPromise.then((data)=>{
            //设置cookie为登录状态
            res.cookie("isLoggedin",true);
            const { userMsg } = data;
            //注册的额外操作
            userAdditionalOperations.RegisterAdditionalActions(userMsg.insertId);
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
exports.loginUser = async function(req, res) {
    try {
        let { userId, userPassword } = req.body;
        let loginQuery = null;
        if (userId.includes('@')) {
            loginQuery = "SELECT userPassword FROM users WHERE userEmail = ? ";
        } else {
            loginQuery = "SELECT userPassword FROM users WHERE userId = ? ";
        }
        const data = await Moric_users.selectUser(loginQuery, [userId]);
        if (!data.state) {
            console.log("查询失败");
            return res.json(new ResponseObj(2000, false, "登录失败"));
        }
        const { userMsg } = data;
        //密码错误操作
        if (userMsg.userPassword != userPassword) {
            return res.json(new ResponseObj(2000, false, "登录失败"));
        }
        res.cookie("isLoggedin", true);
        const token = userAuthentication.createToken({ userId });
        return res.json(new ResponseObj(1000, true, "登录成功", {token}));
    } catch (err) {
        // 处理错误
        console.error(err);
        return res.json(new ResponseObj(2000, false, "登录失败"));
    }
};