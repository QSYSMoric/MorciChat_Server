//路由数据的传递，目的：做到了路由信息和数据信息的分离
const mysql = require('mysql');
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