/* eslint-disable @typescript-eslint/no-var-requires */
import {Server, Socket} from 'socket.io'

function createSocketIo(httpServer?) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            allowedHeaders: ["Content-Type"],
            methods: ["GET,PUT,POST,DELETE,OPTIONS"],
        },
    });
    const meetingIo = io.of('meeting')
    const messages = {}
    meetingIo.on("connection", function (socket: Socket) {
        console.log('连上了')
        socket.join(socket.handshake.query.room + '')
        socket.on("message", async (message, cb) => {
            message = JSON.parse(message)
            console.log(message)
            const room = socket.handshake.query.room + ''
            const roomUsers = await currentUsers(room)
            switch(message.type) {
                case 'talk':
                    if (messages[room]) {
                        messages[room].push({
                            msg: message.msg,
                            from: socket['username'],
                            socketId: socket.id,
                            time: new Date().getTime()
                        })
                    } else {
                        messages[room] = [{
                            msg: message.msg,
                            from: socket['username'],
                            socketId: socket.id,
                            time: new Date().getTime()
                        }]
                    }
                    meetingIo.to(room).emit('message', {
                        type: 'talk',
                        msg: message.msg,
                        from: socket['username'],
                        socketId: socket.id,
                        time: new Date().getTime()
                    })
                    cb()
                    break;
                case 'login':
                    if(roomUsers.findIndex(v => {return v['username'] === message.username}) === -1) {
                        socket['username'] = message.username
                        const roomUsers = await currentUsers(room)
                        socket.send({
                            type: 'login',
                            success: 1,
                            users: roomUsers,
                            from: {
                                socketId:socket.id,
                                username: socket['username']
                            },
                            messages: messages[room] || []
                        })
                    } else {
                        socket.emit('message', {
                            type: 'login',
                            success: 0
                        })
                    }
                    break;
                case 'memberJoin':
                    socket.to(room).emit('message', {
                        type: 'memberJoin',
                        user: {
                            username: socket['username'],
                            socketId: socket.id
                        }
                    })
                    break;
                case 'offer':
                    socket.to(message.socketId).emit('message', {
                        offer: message.offer,
                        type: 'offer',
                        from: socket.id
                    })
                    break;
                case 'answer':
                    socket.to(message.socketId).emit('message', {
                        answer: message.answer,
                        type: 'answer',
                        from: socket.id
                    })
                    break;
                case 'candidate':
                    socket.to(message.socketId).emit('message', {
                        candidate: message.candidate,
                        type: 'candidate',
                        from: socket.id
                    })
                    break;
                case 'leave':
                    meetingIo.to(room).emit('message', {
                        type: 'memberOut',
                        users: await currentUsers(room),
                        from: socket.id
                    })
                    break;
            }
        });
        socket.on('disconnect', async () => {
            const room = socket.handshake.query.room + ''
            meetingIo.to(room).emit('message', {
                type: 'leave',
                users: await currentUsers(room),
                from: socket.id,
                disconnect: 1
            })
        })
    });

    async function currentUsers(room) {
        const roomSockets = await meetingIo.in(room).fetchSockets()
        const roomUsers = roomSockets.map(v => {
            return {
                username: v['username'],
                socketId: v.id
            }
        })
        if (roomSockets.length === 0) {
            delete messages[room]
        }
        return roomUsers
    }
    
}

export default createSocketIo