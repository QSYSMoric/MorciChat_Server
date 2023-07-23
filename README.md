
### 1、服务器返回数据规范
``` javascript
{
    code:number,//状态码
    state:true,//操作状态
    alertMsg:string,//操作信息
    body:obj//返回数据体
}
```
## 2、code操作状态码参考
+ 成功：1000
+ 处理中：1100
+ 处理中：1100
+ 重定向：1200
+ 客户端错误：
    1. 参数错误：2000
    2. 鉴权失败：2100
    3. 请求超时：2200
    4. 资源不存在：2300
    5. 重复提交：2400
    6. 非法操作：2500
    7. 访问受限：2600
+ 服务器错误：
    1. 服务器异常：3000
    2. 数据库错误：3100
    3. 缓存异常：3200
    4. 文件上传失败：3300
    5. 依赖服务错误：3400
    6. 数据错误：3500
    7. 插入失败：3600
### 3、用户数据结构
#### 3.1、用户数据存储
``` javascript
{
	userId:Number,//用户id
	userName:String,//用户名
	userPassword:String,//用户密码
	userProfile:Blob,//用户头像
	userEmail:String,//用户邮箱
	userAge:Number,//用户年龄
	userSignature:String,//用户签名
	userCreateAt:String,//用户创建时间
}
```