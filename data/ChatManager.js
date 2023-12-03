const Chat = require("../classes/Chat")

class ChatsManager{

    latestId = 3
    
    chats = {
        "0" : new Chat("0", "chat3" , "chat3"),
        "1" : new Chat("1", "chat3" , "chat3"),
        "2" : new Chat("2", "chat3" , "chat3"),
        "3" : new Chat("3", "chat3" , "chat3"),
    }


    addChat(chatName , chatDesc){
        this.latestId += 1
        this.chats[this.latestId] = new Chat(this.latestId , chatName , chatDesc)
        if(this.chats[this.latestId]){
            return this.chats[this.latestId]
        }else{
            return "failed"
        }
    }

}

module.exports = ChatsManager