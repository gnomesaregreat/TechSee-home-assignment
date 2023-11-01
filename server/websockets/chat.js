const socket = require("socket.io");
const participantsService = require("../services/participants");
const pubSub = require('pubsub-js');

process.env.maxConnectionsPerUser = "100" // only as concept  move maxConnections to a settings service
exports.createIoSocket = function createIoSocket(server) {
    const io = socket(server);
    handleEvents(io);
}

function handleEvents(io) {
    io.on("connection", handleConnections)
}

async function handleConnections(socket) {
    const connections = await participantsService.getSocket(socket.conn.remoteAddress)
    if (connections > parseInt(process.env.maxConnectionsPerUser)) {
        //close the connection
        return;
    }
    await participantsService.addOrIncreaseSocket(socket.conn.remoteAddress)

    socket.on("join_room", handleJoinRoom)
    socket.on("send_message", handleSendMessage)
    socket.on("disconnect", handleDisconnect)
}

function subscribe(msg,data){
    console.log(msg)
    console.log(data)
}

function handleJoinRoom(room) {
    pubSub.subscribe(room,subscribe);
    pubSub.publish(room,{type:"joinRoom",value:room})
}

function handleSendMessage(data) {
    pubSub.publish(data.room,{type:"sendMessage",value:data.content})
}

function handleDisconnect(socket) {
    return participantsService.removeOrDecreaseSocket(socket.conn.remoteAddress)
}

// io.on("connection", (socket) => {
//     console.log("USER CONNECTED", socket.id);
//
//     socket.on("join_room", (data) => {
//         socket.join(data);
//         console.log("User Joined Room No: " + data);
//     });
//
//     socket.on("send_message", (data) => {
//         console.log("User Send Message", data);
//         socket.to(data.room).emit("receive_message", data.content);
//     });
//
//     socket.on("disconnect", () => {
//         console.log("USER DISCONNECTED");
//     });
// });
