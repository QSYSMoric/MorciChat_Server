//路由数据的传递，目的：做到了路由信息和数据信息的分离
const mysql = require('mysql');
const ResponseMessage = require("../../../plugins/responseMessage");

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
        return Promise.reject(new ResponseMessage(3100,false,"动态数据出错",null));
    }
    let sql = `CREATE TABLE comment_${momentsId} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        timing TIMESTAMP,
        text_content TEXT,
        comment_img LONGBLOB,
        dynamic_id INT DEFAULT ${momentsId}
    );`;
    return new Promise((resolve,reject)=>{
        connection.query(sql,function(err){
            if(err){
                return reject(new ResponseMessage(3100,false,err.message,null));
            }
            return resolve(new ResponseMessage(1000,true,"发布成功",{id:`comment_${momentsId}`}));
        });
    });
}

//获取评论列表
const getCommentsById = async function(momentsId){
    if(!momentsId){
        return Promise.reject(new ResponseMessage(3100,false,"发生意料之外的错误",null));
    }
    let sql = `SELECT user_id,timing,text_content,comment_img,dynamic_id FROM comment_${momentsId} ORDER BY timing DESC`
    return  new Promise((resolve,reject)=>{
        connection.query(sql,function(err,rows){
            if(err){
                return reject(new ResponseMessage(3100,false,err.message,null));
            }
            return resolve(new ResponseMessage(1000,true,"收集评论成功",rows));
        });
    });
}

//发表评论
const postCommentsToMoment = async function(comment){
    if(!comment){
        return Promise.reject(new ResponseMessage(3100,false,"发生意料之外的错误",null));
    }
    let sql = `INSERT INTO comment_${comment.dynamic_id} (user_id, timing, text_content, comment_img, dynamic_id) VALUES (?, ?, ?, ?, ?);`;
    return new Promise((resolve,reject)=>{
        connection.query(sql,[comment.user_id,comment.timing,comment.text_content,comment.comment_img,comment.dynamic_id],function(err,rows){
            if(err){
                return reject(new ResponseMessage(3100,false,err.message,null));
            }
            return resolve(new ResponseMessage(1000,true,"发表成功",rows));
        });
    });
}

module.exports = {
    createComment,
    getCommentsById,
    postCommentsToMoment
}