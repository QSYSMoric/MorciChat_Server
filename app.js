require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);

//WebSocket服务器
const socketWrapper = require('./server/utils/socketWrapper');
const io = socketWrapper(server);
// 挂载 io 到全局
app.locals.io = io;
// 存储 io 对象到全局
global.io = io;

//模板引擎
const exphbs = require('express-handlebars');
const handlebars = exphbs.create({extname:'.hbs'});
app.engine('.hbs',handlebars.engine);
app.set('view engine','.hbs');

//配置中间件middleware,解析传入数据
app.use(express.urlencoded({limit: '50mb',extended:true}));
app.use(express.json({limit: '50mb',extended:true}));

//配置中间件cookie处理cookie
const secretKey = "Moric";//密钥
const cookieParser=require("cookie-parser");
app.use(cookieParser(secretKey));

//处理请求
const routes = require("./server/routers/user");
app.use('/moric',routes);

//处理未找到
app.all('/',(req,res)=>{
    console.log(req.ip);
    res.send('404');
});
const port = process.env.PORT || 5000;
//开启服务器
server.listen(port,()=>{
    console.log(`端口号：${port}，服务启动成功`);
});