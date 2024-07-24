const bodyParser = require('body-parser')
const express = require('express')
const { readdirSync } = require('fs')
const app = express()
const cookieParser = require('cookie-parser')
const { configDotenv } = require('dotenv').config()
const cors = require('cors')
const body = require('body-parser')
const conn = require('./app/connection/conn')


/const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Add this line

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store users and their sockets
const users = {};

app.use(cors()); // Add this line

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (username) => {
        users[username] = socket.id;
        console.log(`User joined: ${username}`);
    });

    socket.on('private_message', ({ sender, recipient, message }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('private_message', { sender, message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (let username in users) {
            if (users[username] === socket.id) {
                delete users[username];
                break;
            }
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


