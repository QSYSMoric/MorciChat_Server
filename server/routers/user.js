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
router.post('/publishMoments',userAuthentication.checkTokenMiddleware,userController.publishMoments);
router.post('/getNewMoments',userAuthentication.checkTokenMiddleware,userController.getNewMoments);
router.post('/pickInformation',userAuthentication.checkTokenMiddleware,userController.pickInformation);
router.post('/getComments',userAuthentication.checkTokenMiddleware,userController.getComments);
router.post('/setComments',userAuthentication.checkTokenMiddleware,userController.setComments);
router.post('/getFriendList',userAuthentication.checkTokenMiddleware,userController.getFriendList);
router.post('/getChatRecords',userAuthentication.checkTokenMiddleware,userController.getChatRecords);
router.post('/updateLastContactTime',userAuthentication.checkTokenMiddleware,userController.updateLastContactTime);
router.post('/getFriendApplicationList',userAuthentication.checkTokenMiddleware,userController.getFriendApplicationList);
router.post('/changePersonalInformation',userAuthentication.checkTokenMiddleware,userController.changePersonalInformation);
router.post('/getMomentsMy',userAuthentication.checkTokenMiddleware,userController.getMomentsMy);
module.exports = router;