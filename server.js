let localDB;
let dbconnection = 'mongodb://localhost';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended: true}));

MongoClient.connect(dbconnection, (err, database) =>
{
    if (err)
        return console.log(err);

    localDB = database.db('tictactoe');
    app.listen(0, () =>
    {
        console.log('MONGODB listening on 3000')
    });
});

function databaseStore(message, timeStamp)
{
    let storeData = {
        chatMessage: message,
        timeStamp  : timeStamp
    };

    localDB.collection('chatroom-chats').save(storeData, (err, result) =>
    {
        if (err)
            return console.log(err);

        console.log('saved to database', result);
    });
}

app.get('/', (req, res) => res.send('Chat Server'));

io.on('connection', (socket) =>
{

    console.log('user connected');

    socket.on('disconnect', () => console.log('user disconnected'));

    socket.on('add-message', (message) =>
    {
        const timeStamp = new Date().getTime();

        io.emit('message', {
            type: 'new-message',
            text: message,
            date: timeStamp
        });
        // Function above that stores the message in the database
        databaseStore(message, timeStamp);
    });

});

http.listen(PORT, () => console.log('Server started on port 5000'));
