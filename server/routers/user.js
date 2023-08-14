//路由信息的跳转
const express = require('express');
const router = express.Router();
//导入其他处理程序
const userController = require('../controllers/userController');
const userAuthentication = require('../utils/userAuthentication');
// router.use();
//注册按钮
router.post('/register',userController.createUser);
router.post('/login',userController.loginUser);
router.post('/getUserInformation',userAuthentication.checkTokenMiddleware,userController.getUserInformation);
router.post('/publishMoments',userAuthentication.checkTokenMiddleware,userController.publishMoments)
module.exports = router;