//路由数据的传递，目的：做到了路由信息和数据信息的分离
const mysql = require('mysql');
const responseMessage = require("../../../plugins/responseMessage");

//连接数据库
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_TABLE_friendcircle,
});

// 测试连接
connection.connect(err=>{
    if(err){
        console.log(err);
        console.log("朋友圈数据库连接失败");
    }else{
        console.log('朋友圈数据库连接成功');
    }
});

//发表动态入库
const createFriendcircle = async function(sql,field){
    return new Promise((resolve,reject)=>{
        connection.query(sql,field,function(err,rows){
            if(err){
                return reject(new responseMessage(3100,false,err.message,null));
            }
            return resolve(new responseMessage(1000,true,"发布成功",rows));
        });
    });
}

//为动态装入commentInformation(评论区)
const installationComment = async function(momentsId,commentInformationId) {
    if (!commentInformationId) {
        return Promise.reject(new responseMessage(3100, false, "评论区为空", null));
    }
    let sql = `UPDATE friend_circle SET commentInformation = ? WHERE publishId = ?;`;
    return new Promise((resolve, reject) => {
        connection.query(sql, [commentInformationId,momentsId], function(err) {
            if (err) {
                return reject(new responseMessage(3100, false, err.message, null));
            }
            return resolve(new responseMessage(1000, true, "发布成功", null));
        });
    });
}

//查询某个时间之前的10条动态
const pagingCommentList = async function(timing){
    if(!timing){
        return Promise.reject(new responseMessage(3100, false, "发生错误", null));
    }
    let sql = `
    SELECT publishId, publisher, publicTiming, friendCircleCopy, friendCirclePictures, commentInformation FROM friend_circle
    WHERE publicTiming < '${timing}'
    ORDER BY publicTiming DESC
    LIMIT 5;`
    return new Promise((resolve, reject)=>{
        connection.query(sql,function(err,rows){
            if(err){
                return reject(new responseMessage(3100, false, err.message, null));
            }
            return resolve(new responseMessage(1000,true,"查询成功",rows));
        })
    })
}

module.exports = {
    createFriendcircle,
    installationComment,
    pagingCommentList
}