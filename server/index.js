const express = require("express");
const app = express();
const cors = require("cors");
const chat = require("./websockets/chat");
app.use(cors());
app.use(express.json());

const server = app.listen("3002", () => {
    console.log("Server Running on Port 3002...");
});


chat.createIoSocket(server)
