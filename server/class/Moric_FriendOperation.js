class Moric_FriendOperation{
    constructor(userId,friendId,status = "Pending",illustrate = "addFriend") {
        this.userId = userId;
        this.friendId = friendId;
        this.status = status;
        this.illustrate = illustrate;
    }
}

module.exports = Moric_FriendOperation;