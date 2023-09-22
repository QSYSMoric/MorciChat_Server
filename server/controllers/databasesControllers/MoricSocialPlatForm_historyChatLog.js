//路由数据的传递，目的：做到了路由信息和数据信息的分离
const mysql = require('mysql');
const ResponseMessage = require("../../../plugins/responseMessage");
//连接数据库
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_TABLE_historychatlog,
});

// 测试连接
connection.connect(err=>{
    if(err){
        console.log(err);
        console.log("聊天历史记录数据库连接失败");
    }else{
        console.log('聊天历史记录数据库连接成功');
    }
});

//获取聊天记录
const getChatHistoryRecords = async function(chatId){
    if(!chatId){
        return Promise.reject(new ResponseMessage(3100,false,"id不可为空",{}));
    }
    let sql = `
        SELECT senderId, timing, text_content, img, dynamic_id, historyid FROM ${chatId} ORDER BY timing ASC;
    `;
    return new Promise((resolve,reject)=>{
        connection.query(sql,(err,rows)=>{
            if(err){
                return reject(new ResponseMessage(3100,false,"查询出错",new Error(err)));
            }
            return resolve(new ResponseMessage(1000,true,"查询成功",rows));
        });
    });
}

//创建聊天历史聊天记录表
const craeteChatHistory = async function(historyId){
    return new Promise((resolve,reject)=>{
        if(!historyId){
            reject(new ResponseMessage(3100,false,"历史记录id不可为空"));
        }
        let createChatHistorySql = `CREATE TABLE ${historyId} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            senderId INT,
            timing TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            text_content VARCHAR(255),
            img LONGBLOB,
            dynamic_id VARCHAR(255),
            historyId varchar(255) NOT NULL
        );`
        connection.query(createChatHistorySql,(err)=>{
            if(err){
                reject(new ResponseMessage(3100,false,"聊天记录历史缓存失败"));
            }
            resolve(new ResponseMessage(1000,true,"聊天记录创建成功"));
        });
    });
}

//记录历史聊天数据
const recordChatInformation = async function(chatMsg){
    return new Promise((resolve,reject)=>{
        if(!chatMsg || !chatMsg.historyId){
           return reject(new ResponseMessage(2100,false,"参数错误"));
        }
        let sql = `INSERT INTO ${chatMsg.historyId} (senderId, timing, text_content, img, dynamic_id, historyId)
        VALUES (? ,?, ?, ?, ?, ?);`;
        connection.query(sql,[chatMsg.senderId,chatMsg.timing,chatMsg.text_content,chatMsg.img,chatMsg.dynamic_id,chatMsg.historyId],(err)=>{
            if(err){
               return reject(new ResponseMessage(3100,false,"对方不是你的好友",err));
            }
            return resolve(new ResponseMessage(1000,true,"成功"));
        });

    });
}

//
const isHaved = async function(historyId){
    let isHavedSql = `SELECT 1 FROM information_schema.tables WHERE table_name = '${historyId}' LIMIT 1;`;
    return new Promise((resolve,reject)=>{
        connection.query(isHavedSql,(err,rows)=>{
            if(err){
                reject(new ResponseMessage(3100,false,"查询出错",err));
            }
            resolve(new ResponseMessage(1000,true,"查询成功",rows[0]));
        });
    })
}

module.exports = {
    getChatHistoryRecords,
    craeteChatHistory,
    recordChatInformation,
    isHaved
}