import { Room, Client } from "colyseus";
import { OmneaRoomState, Player } from "./schema/OmneaRoomState";

export class OmneaRoom extends Room<OmneaRoomState> {

  maxClients = 30;

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
      console.log(message);
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

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
