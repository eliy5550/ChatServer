const express = require('express')
const ChatsManager = require('./data/ChatManager')
const app = express()
const bp = require('body-parser')
const { connectToDB, getDB } = require('./data/db')
const Chat = require('./classes/Chat')
const { ObjectId } = require('mongodb')
const Message = require('./classes/Message')

app.use(bp.json())

//const chatsManager = new ChatsManager()

var db;
connectToDB((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log('listening on http://127.0.0.1:3000/')
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

    db.collection('chats')
        .find()
        .forEach(chat => {
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
        .then(doc =>{
            return res.status(200).json(doc)
        })
        .catch(err =>{res.status(500).json({error:"cant fetch"})})
})

app.post('/chat/:id/sendmessage', (req, res) => {
    if(!ObjectId.isValid(req.params.id)) return res.json({'error' : "invalid chat id"})
    const newMessage = new Message(req.body.name , req.body.message, Date.now())
    
    db.collection('chats')
    .updateOne({_id : new ObjectId(req.params.id)} , {$push : {messages : newMessage}})
    .then(res.status(200).json(newMessage))
    .catch(err => {return res.status(500).json({error : err})})

})