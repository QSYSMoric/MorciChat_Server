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
const getChatHistoryRecords = async function(){
    
}

module.exports = {

}