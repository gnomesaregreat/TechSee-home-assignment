const socket = require("socket.io");
const participantsService = require("../services/participants");
const messagesService = require("../services/messages");
const pubSub = require('pubsub-js');
let io;
process.env.maxConnectionsPerUser = "100" // only as concept  move maxConnections to a settings service


exports.createIoSocket = function createIoSocket(server) {
    io = socket(server);
    handleEvents(io);
}

function handleEvents(io) {
    io.on("connection", handleConnections)
}

async function handleConnections(socket) {
    socket.ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress.split(":")[3];

    const connections = await participantsService.getSocket(socket.ip)
    if (connections > parseInt(process.env.maxConnectionsPerUser)) {
        //close the connection
        return;
    }
    await participantsService.addOrIncreaseSocket(socket.ip)

    socket.on("join_room", (room) => handleJoinRoom(room, socket))
    socket.on("send_message", handleSendMessage)
    socket.on("disconnect", handleDisconnect)
}

function subscribe(room, msg) {
    console.log("room", room, "msg", msg);
    io.to(room).emit(msg.type, msg);
}

function handleJoinRoom(room, socket) {
    socket.join(room);
    pubSub.subscribe(room, subscribe);
    pubSub.publish(room, {type: "joinRoom", value: room})
}

async function handleSendMessage(data) {
    await messagesService.addMessage(data.room, data.content)
    pubSub.publish(data.room, {type: "msg", value: data.content})
}

function handleDisconnect(socket) {
    return participantsService.removeOrDecreaseSocket(socket.ip)
}
