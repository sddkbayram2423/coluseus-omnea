import { Room } from "colyseus";

export class ChatRoom extends Room {
  // this room supports only 4 clients connected
  // maxClients = 30;
  participants = {
    global: {
      roomName: "global",
      participants: [],
    },

  };
  part = [];

  onCreate(options) {
    console.log("ChatRoom created!", options);

    this.onMessage("send-room-chat-message", (client, message) => {
      console.log({ room: message });

      if (this.participants[message.roomName]) {
        let roomUsers = this.participants[message.roomName].participants;
        roomUsers.forEach((user) => {
          let receiver = this.clients.filter(
            (cl) => cl.sessionId === user.sessionId
          );

          if (receiver[0]) {
            receiver[0].send("new-room-chat-message", message.message);
          }
        });
      }
    });

    this.onMessage("send-global-chat-message", (client, message) => {
      this.broadcast("new-global-chat-message", message);
    });

    this.onMessage("public-chat-message", (client, message) => {
      this.broadcast("new-public-chat-message", message);
    });

    this.onMessage("private-chat-message", (client, message) => {
      let receiver = this.clients.filter(
        (cl) => message.receiverSocketId === cl.sessionId
      );

      if (receiver[0]) {
        receiver[0].send("new-private-chat-message", message.message);
      }
    });
    this.onMessage("new-client-joined", (client, participant) => {
      this.part.push(participant);
      this.broadcast("new-client-joined", this.part);
    });

    this.onMessage("new-client-joined-room", (client, roomDetail) => {
      if (!this.participants[roomDetail.roomName]) {
        const newRoom = {
          roomName: roomDetail.roomName,
          participants: [],
        };
        const newRooms = {};
        newRooms[roomDetail.roomName] = newRoom;

        this.participants = Object.assign({}, this.participants, newRooms);

      }

      if (this.participants[roomDetail.roomName]) {

        let participants = this.participants[roomDetail.roomName].participants;
        let isParticiantExist = participants.filter((item) => item.username === roomDetail.participant.username).length <= 0



        if (isParticiantExist) {
          this.participants[roomDetail.roomName].participants.push(
            roomDetail.participant
          );
        }
      }

      this.broadcast("new-client-joined-room", this.participants);
    });

    this.onMessage("new-client-joined-global-room", (client, participant) => {
      if (
        this.participants["global"].participants.filter((item) => item.username === participant.username).length <= 0
      ) {
        this.participants["global"].participants.push(participant);
      }

      this.broadcast(
        "new-client-joined-global-room",
        this.participants["global"].participants
      );
    });
  }

  onJoin(client) {
    // this.broadcast("messages", `${ client.sessionId } joined.`);
  }

  async onLeave(client) {

    console.log({ client } + " Left room");

   
    this.part = this.part.filter((par) => par.id !== client.sessionId);



    Object.keys(this.participants).flatMap(key => {
      let room = this.participants[key];
      let newParticpants = room.participants.filter((par) => par.sessionId !== client.sessionId);
      this.participants[key].participants = newParticpants;
      }
    );


    this.broadcast("client-left-room", this.participants);



    this.broadcast("new-client-joined", this.part);
    try {
      await this.allowReconnection(client, 60);
      console.log("Reconnected!");

      client.send("status", "Welcome back!");
    } catch (e) {
      console.log(e);
    }
  }

  onDispose() {
    console.log("Dispose ChatRoom");
  }
}
