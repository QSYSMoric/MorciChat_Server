class Moric_ChatMessage{
    constructor(senderId,timing,text_content,img,dynamic_id,lastContactTime){
        this.senderId = senderId;
        this.timing = timing;
        this.text_content = text_content;
        this.img = img;
        this.dynamic_id = dynamic_id;
        this.lastContactTime = lastContactTime;
    }
}

module.exports = Moric_ChatMessage;