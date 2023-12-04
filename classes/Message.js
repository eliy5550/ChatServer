class Message {
    constructor(user , message , time ){
        this.message = message 
        this.time = new Date()
        this.user = user
    }
}
module.exports = Message