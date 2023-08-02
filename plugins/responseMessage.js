class ResponseObj{
    constructor(code = null,state = null,alertMsg = null,body = null){
        this.code = code;
        this.state = state;
        this.alertMsg = alertMsg;
        this.body = body;
    }
}

module.exports = ResponseObj;