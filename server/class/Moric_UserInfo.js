const imageProcessing = require("../utils/imageProcessing");

module.exports = class UserInfo{
    constructor(userId,userName,userProfile,userProfileType,userEmail,userAge,userSignature){
        this.userId = userId;
        this.userName = userName;
        this.userProfile = imageProcessing.binaryToBase64(userProfile);
        this.userProfileType = userProfileType;
        this.userEmail = userEmail;
        this.userAge = userAge;
        this.userSignature = userSignature;
    }
}