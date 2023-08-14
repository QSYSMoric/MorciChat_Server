class Moric_Moments{
    constructor(id,timing,friendCircleCopy,friendCircleImg){
        this.publisher = id;
        this.publishTiming = timing;
        this.friendCircleCopy = friendCircleCopy;
        this.friendCircleImg = friendCircleImg;
    }
    setMomentsId(id){
        this.publishId = id;
    }
    setCommentformationId(id){
        this.commentformationId = id;
    }
}
module.exports = Moric_Moments;