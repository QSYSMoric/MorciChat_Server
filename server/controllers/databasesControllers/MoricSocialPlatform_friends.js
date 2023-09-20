//路由数据的传递，目的：做到了路由信息和数据信息的分离
const mysql = require('mysql');
const ResponseMessage = require("../../../plugins/responseMessage");
const day = require("../../../plugins/day");
//连接数据库
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_TABLE_FRIENDS,
});

// 测试连接
connection.connect(err=>{
    if(err){
        console.log(err);
        console.log("好友数据库连接失败");
    }else{
        console.log('好友数据库连接成功');
    }
});

//增加表操作
const createFriendTable = async function(sql){
    return new Promise((resolve,reject)=>{
        connection.query(sql,function(err,rows){
            //创建表失败后的结果
            if(err){
                return reject({ 
                    code:"3100",
                    alert:'创建好友列表失败:' + err,
                    state:false,
                    userMsg:null
                });
            };
            //创建表成功后的结果
            return resolve({
                code:"1000",
                alert:'创建好友列表成功',
                state:true,
                userMsg:rows
            });
        });
    });
}

//插入数据操作
const insertIntoFriend = async function(sql,field){
    return new Promise((resolve,reject)=>{
        connection.query(sql,field,function(err,rows){
            //插入数据失败后的结果
            if(err){
                console.log(err);
                return reject({ 
                    code:"3100",
                    alert:'添加好友失败:' + err,
                    state:false,
                    userMsg:null
                });
            };
            //插入数据成功后的结果
            return resolve({
                code:"1000",
                alert:'请求已经发过去了',
                state:true,
                userMsg:rows
            });
        });
    });
}

//获取好友列表
const getFriendList = async function(userId){
    if(!userId){
        return Promise.reject(new ResponseMessage(3100,false,"id不可为空",{}));
    }
    return new Promise((resolve,reject)=>{
        let sql = `
            SELECT friendId, remark, chatHistory, friendStatus, lastContacttime
            FROM ${userId}friendlist
            WHERE friendStatus = 'confirmed';
        `;
        connection.query(sql,function(err,rows){
            if(err){
                return reject(new ResponseMessage(3100,false,"数据库出错",{}));
            }
            return resolve(new ResponseMessage(1000,true,"成功",rows));
        });
    });
}

//查询是否与该用户建立了好友关系
const isItFriend = async function(userId,fridendId){
    if(!userId || !fridendId){
        return Promise.reject(new ResponseMessage(3100,false,"id不可为空",{}));
    }
    let sql = `
        SELECT friendStatus
        FROM ${userId}friendlist
        WHERE friendId = ?;
    `;
    return new Promise((resolve,reject)=>{
        connection.query(sql,[fridendId],(err,rows)=>{
            if(err){
                return reject(new ResponseMessage(3100,false,"你们不是好友",{}));
            }
            return resolve(new ResponseMessage(1000,true,"成功",rows));
        })
    });
}

//更新与好友的最后一次联系时间
const updateLastContactTime = async function(userId,fridendId){
    if(!userId || !fridendId){
        return Promise.reject(new ResponseMessage(3100,false,"id不可为空",{}));
    }
    let now = day.nowTime();
    let sql = `
        UPDATE ${userId}friendlist
        SET lastContactTime = ?
        WHERE friendId = ?;
    `;
    return new Promise((resolve,reject)=>{
        connection.query(sql,[now,fridendId],(err)=>{
            if(err){
                return reject(new ResponseMessage(3100,false,"数据库出错",{}));
            }
            return resolve(new ResponseMessage(1000,true,"成功",{ lastContacttime:now }));
        })
    });
}   

module.exports = {
    createFriendTable,
    insertIntoFriend,
    getFriendList,
    updateLastContactTime,
    isItFriend
}