import { Room, Client } from "colyseus";
import { OmneaRoomState, Player } from "./schema/OmneaRoomState";

export class OmneaRoom extends Room<OmneaRoomState> {

  maxClients = 30;
  participants = {
  };
  part = [];

  onCreate(options: any) {

    console.log(options);
    this.roomId = options.roomslug;
    this.setState(new OmneaRoomState());
    this.onMessage("updatePosition", (client, data) => {
      //console.log("update received -> ");
      //console.debug(JSON.stringify(data));
      const player = this.state.players.get(client.sessionId);
      player.x = data["x"];
      player.y = data["y"];
      player.z = data["z"];
    });
    this.onMessage("updateRotation", (client, data) => {
      //console.log("update received -> ");
      //console.debug(JSON.stringify(data));
      const player = this.state.players.get(client.sessionId);
      player.rx = data["rx"];
      player.ry = data["ry"];
      player.rz = data["rz"];
    });
    this.onMessage("global", (client, data) => {
      //console.log("update received -> ");
      //console.debug(JSON.stringify(data));
    });
    this.onMessage("message", function (client, message) {
      // console.log(message);
    });

    this.onMessage("send-room-chat-message", (client, message) => {

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
  
    this.onMessage("new-client-joined", (client, participant) => {
      this.part.push(participant);
      this.broadcast("new-client-joined", this.part);
    });

    this.onMessage("new-client-joined-room", (client, roomDetail) => {
      console.log("new-client-joined-room", roomDetail)
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

  }

  onJoin(client: Client, options: any) {
    // console.log(this.roomId)
    // console.log(this.locked)
    // if (this.locked) {
    //   onCreate({roomslug: this.roomId + '_new'})
    // }
    // Randomize player position on initializing.
    const newPlayer = new Player();
    //newPlayer.x = Math.random() * 7.2 - 3.6;
    //newPlayer.y = 1.031;
    //newPlayer.z = Math.random() * 7.2 - 3.6;
    this.state.players.set(client.sessionId, newPlayer);
    const player = this.state.players.get(client.sessionId);
    player.nickname = options.nickname;
    player.avatar = options.avatar;
    player.color1 = options.color1;
    player.color2 = options.color2;
    player.color3 = options.color3;
    console.log(player.nickname);
    console.log(player.avatar);
    console.log(player.color1);
    console.log(player.color2);
    console.log(player.color3);

    //this.state.players.set(client.sessionId, new Player());
    //client.userData = { nickname: options.nickname + client.sessionId };

    console.log(client.sessionId, player.nickname, "joined!", this.roomId);
  }

  async onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);

    console.log(client.sessionId, "left!");

    this.part = this.part.filter((par) => par.id !== client.sessionId);
    Object.keys(this.participants).flatMap(key => {
      let room = this.participants[key];
      let newParticpants = room.participants.filter((par) => par.sessionId !== client.sessionId);
      this.participants[key].participants = newParticpants;
      }
    );

    this.broadcast("client-left-room", this.participants);
    try {
      await this.allowReconnection(client, 60);
      console.log("Reconnected!");

      client.send("status", "Welcome back!");
    } catch (e) {
      console.log(e);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
