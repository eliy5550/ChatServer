const express = require('express')
const ChatsManager = require('./data/ChatManager')
const app = express()
const bp = require('body-parser')

app.use(bp.json())

const chatsManager = new ChatsManager()

app.get('/' , (req , res)=>{
    return res.send('ok')
})

app.get('/chat/:chatId' , (req , res)=>{
    const chat = chatsManager.chats[req.params.chatId]
    if (chat !== undefined) return res.json(chat)
    return res.send("cant find chat")
})


app.post('/chat/:chatId/sendMessage' , (req , res)=>{
    if (req.body.message === undefined || req.body.user === undefined){return res.send('missing data')}
    try {
        chatsManager.chats[req.params.chatId].sendMessage(req.body.user , req.body.message)
        return res.send(chatsManager.chats[req.params.chatId])
    } catch (error) {
        return res.send('error : ' + error)
    }
})

app.post('/addchat' , (req , res)=>{
    if (req.body.name === undefined || req.body.desc === undefined){return res.send('missing data')}
    try {
        return res.send(chatsManager.addChat(req.body.name , req.body.desc))
    } catch (error) {
        return res.send('error : ' + error)
    }
})

app.listen(3000 , ()=>{
    console.log('listening on http://127.0.0.1:3000/')
})