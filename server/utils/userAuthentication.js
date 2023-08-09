"use strict";
const day = require("../../plugins/day");
//导入token
const jwt = require('jsonwebtoken');
//创建token
let secretKey = 'Moric';
//创建并返回一个token
const createToken = function(data){
    const currentTime = day.nowTime();
    data.currentTime = currentTime;
    return jwt.sign(data,secretKey,{
        expiresIn:60*60*24
    });
}

//token校验
const checkTokenMiddleware = (req,res,next)=>{
    let token = req.get("token");
    //没有token令牌
    if(!token){
        return res.json({
            code:2600,
            alertMsg:"你还没有登录",
            state:false,
            data:null
        });
    }
    //校验成功
    jwt.verify(token,secretKey,(err,data)=>{
        if(err){
            return res.json({
                code:2100,
                alertMsg:"验证出错",
                state:false,
                data:null
            });
        }
        req.userDate = data;
        next();
    });
}

//socket验证中间件
const checkTokenMiddlewareSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    // 没有 token 令牌
    if (!token) {
        return next(new Error('用户信息过期'));
    }
    // 校验 token
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            let error = new Error('验证信息出错');
            error.state = false;
            next(error);
            throw error;
        }
        // 验证成功
        socket.userDate = decoded;
        next();
    });
};


module.exports = {
    createToken,
    checkTokenMiddleware,
    checkTokenMiddlewareSocket
}