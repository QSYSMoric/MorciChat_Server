//路由数据的传递，目的：做到了路由信息和数据信息的分离
const mysql = require('mysql');
const responseMessage = require("../../../plugins/responseMessage");

//连接数据库
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_TABLE_comment,
});

// 测试连接
connection.connect(err=>{
    if(err){
        console.log(err);
        console.log("评论区数据库连接失败");
    }else{
        console.log('评论区数据库连接成功');
    }
});

//创建评论区
const createComment = async function(momentsId){
    if(!momentsId){
        return Promise.reject(new responseMessage(3100,false,"动态数据出错",null));
    }
    console.log(momentsId)
    let sql = `CREATE TABLE comment_${momentsId} (
        user_id INT PRIMARY KEY,
        timing TIMESTAMP,
        text_content TEXT,
        comment_img LONGBLOB,
        dynamic_id INT DEFAULT ${momentsId}
    );`;
    return new Promise((resolve,reject)=>{
        connection.query(sql,function(err){
            if(err){
                console.log(err.message);
                return reject(new responseMessage(3100,false,err.message,null));
            }
            return resolve(new responseMessage(1000,true,"发布成功",{id:`comment_${momentsId}`}));
        });
    });
}

module.exports = {
    createComment
}