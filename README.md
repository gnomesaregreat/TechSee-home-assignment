# TechSee-home-assignment
A simple yet scalable chat app
<p align="center" >
  <img width="60%" src="https://github.com/gnomesaregreat/TechSee-home-assignment/assets/87971291/1e104e7d-0689-4239-b76c-aa553c928243" />
</p>

# Architecture flow
- whenever a client enters the app he will first get the latest messages from the messages service and by scrolling will get more and more messages
- the client will connect a WebSocket service to send and receive messages in real-time
  - a load balancer will be in charge of setting a max connection per service to 500 and distributing connections to the least amount of connections.
  - websocket service that gets a connection will check if the IP has reached the max connections using the Participants Service and will add the participant if needed.
  - when a client connects the system will open a channel in a pub-sub system so other web services will be able to send messages for him without knowing about all the other services.
  - messages will be written into the messages services.
