const Message = require("./Message")

class Chat{
    messages = []
    
    constructor(chatName,chatDesc){
        this.name = chatName
        this.desc = chatDesc
    }

}

module.exports = Chat