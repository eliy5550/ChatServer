const express = require('express')
const app = express()
const bp = require('body-parser')
const { connectToDB, getDB } = require('./data/db')
const Chat = require('./classes/Chat')
const { ObjectId } = require('mongodb')
const Message = require('./classes/Message')
const cors = require('cors');


//public API
app.use(cors());

app.use(bp.json())

app.use(express.static('build'))

//const chatsManager = new ChatsManager()

var db;
connectToDB((err) => {
    if (!err) {
        app.listen(5000, () => {
            console.log('listening on http://127.0.0.1:5000/')
        })
        db = getDB();
    }
})


app.get('/', (req, res) => {
    return res.send('ok')
})

app.post('/addchat', (req, res) => {
    if (req.body.name === undefined || req.body.descr === undefined)
        return res.status(400).json({ error: 'missing info' })
    var chat = new Chat(req.body.name, req.body.descr)
    console.log(chat)
    db.collection('chats')
        .insertOne(chat)
        .then(() => {
            return res.status(200).json(chat)
        }
        ).catch(err => {
            return res.status(500).json({ error: err })
        })
})

app.get('/chats', (req, res) => {
    const chats = []
    const maxMessagesInChat = 2
    db.collection('chats')
        .find()
        .forEach(chat => {
            const messagesForChat = []
            if (chat.messages === undefined) { chat.messages = [] }
            for (let x = 0; x < maxMessagesInChat; x++) {
                let i = chat.messages.length - x - 1
                let message = chat.messages[i]
                messagesForChat.push(message)
            }
            chat.messages = messagesForChat.reverse()
            chats.push(chat)
        })
        .then(() => {
            return res.status(200).json(chats)
        })
        .catch(err => { return res.status(500).json({ error: err }) })
})

app.get('/chat/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "chat id not valid" })

    db.collection('chats')
        .findOne({ _id: new ObjectId(req.params.id) })
        .then(doc => {
            return res.status(200).json(doc)
        })
        .catch(err => { res.status(500).json({ error: "cant fetch" }) })
})

app.post('/chat/:id/sendmessage', (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.json({ 'error': "invalid chat id" })
    const newMessage = new Message(req.body.name, req.body.message, Date.now())
    newMessage._id = new ObjectId()
    db.collection('chats')
        .updateOne({ _id: new ObjectId(req.params.id) }, { $push: { messages: newMessage } })
        .then(res.status(200).json(newMessage))
        .catch(err => { return res.status(500).json({ error: err }) })

})

app.get('/chat/:id/getAllMessages', (req, res) => {
    const messages = []
    if (!ObjectId.isValid(req.params.id)) { return res.status(400).json({ error: "chat Id not valid" }) }
    db.collection('chats')
        .findOne({ _id: new ObjectId(req.params.id) })
        .then(chat => {
            if (!chat) { return res.status(400).json({ error: "chat not found in the db" }) }
            if (chat.messages) {
                chat.messages.map(m => {
                    messages.push(m)
                })
            }
            return res.status(200).json(messages)
        })
        .catch((error) => {
            return res.status(500).json(error)
        })
})

app.post('/chat/:id/getOlderMessages', (req, res) => {
    if (!ObjectId.isValid(req.params.id)) { return res.status(400).json({ error: "chat Id not valid" }) }
    const messages = []
    db.collection('chats').findOne({ _id: new ObjectId(req.params.id) })
        .then(chat => {
            if (chat.messages === undefined) { res.status(200).json([]) }
            const cMessages = chat.messages
            let count = 0
            let isCollecting = false
            if (req.body.lastmessage == null || req.body.lastmessage === undefined || req.body.lastmessage == "") { isCollecting = true }
            for (let x in cMessages) {
                const i = cMessages.length - x - 1
                console.log(cMessages[i]._id)
                if (isCollecting) {
                    messages.push(cMessages[i])
                    count++;
                    if (count == 2) { break }
                } else {
                    if (cMessages[i]._id == req.body.lastmessage) {
                        isCollecting = true
                    }
                }
            }
            return res.status(200).json(messages.reverse())
        })
})

app.post('/chat/loadNewMessages', async (req, res) => {
    //go through the data passed in
    const reqChats = req.body.chats;
    const resChats = []

    for (let i = 0; i < reqChats.length; i++) {
        const reqChat = reqChats[i];
        const dbChat = await db.collection('chats').findOne({ _id: new ObjectId(reqChat._id) })

        //for each, get the chat's messages
        const dbMessages = dbChat.messages
        if (dbMessages === undefined) {
            resChats.push({ ...reqChat, messages: [] });
        } else {
            const collectedMessages = []
            //if no messages in chat at client send 2 messages
            let count = 2
            //from bottom up push messages in
            for (let j = 0; j < dbMessages.length; j++) {
                const dbMessage = dbMessages[dbMessages.length - 1 - j]
                if (dbMessage._id == reqChat.newest) {
                    //if hit newest message break the loop
                    break
                }else if(reqChat.newest == ""){
                    collectedMessages.push(dbMessage)
                    count --;
                    if(count <= 0){break}
                }
                collectedMessages.push(dbMessage)
            }
            //push into array of results
            //resChats.push({ ...reqChat, messages: collectedMessages })
            resChats.push({ ...reqChat, messages: collectedMessages })
        }
    }

    return res.status(200).json(resChats.reverse())


})