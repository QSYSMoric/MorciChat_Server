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
            code:"2600",
            alert:"你还没有登录",
            state:false,
            data:null
        });
    }
    //校验成功
    jwt.verify(token,secretKey,(err,data)=>{
        if(err){
            return res.json({
                code:"2100",
                alert:"验证出错",
                state:false,
                data:null
            });
        }
        req.userDate = data;
        next();
    });
}

module.exports = {
    createToken,
    checkTokenMiddleware
}