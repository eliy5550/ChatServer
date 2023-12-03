const Message = require("./Message")

class Chat{
    messages = []
    lastestMessageId = -1

    constructor(chatId,chatName,chatDesc){
        this.id = chatId
        this.name = chatName
        this.desc = chatDesc
    }

    sendMessage(name , message) {
        this.lastestMessageId += 1
        this.messages.push(new Message(this.lastestMessageId , message , new Date() , name))    
    }
}

module.exports = Chat