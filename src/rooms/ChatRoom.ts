import { Room } from "colyseus";

export class ChatRoom extends Room {
    // this room supports only 4 clients connected
    maxClients = 30;
    roomParticipants = [];

    onCreate(options) {
        console.log("ChatRoom created!", options);

        this.onMessage("public-chat-message", (client, message) => {
    
            this.broadcast("new-public-chat-message", message);
        });

        this.onMessage("private-chat-message", (client, message) => {
                
            let receiver=this.clients.filter(cl => message.receiverSocketId===cl.sessionId);
            receiver[0].send("new-private-chat-message",message.message);
            
        });
        this.onMessage("new-client-joined", (client, participant) => {

            this.roomParticipants.push(participant);
            this.broadcast("new-client-joined", this.roomParticipants);
        });  

    }

    onJoin(client) {
        // this.broadcast("messages", `${ client.sessionId } joined.`);
    }

    async onLeave(client) {
        // this.broadcast("messages", `${ client.sessionId } left.`);
        this.roomParticipants = this.roomParticipants.filter(
            (par) => par.id !== client.sessionId
        );

        this.broadcast("new-client-joined", this.roomParticipants);
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
