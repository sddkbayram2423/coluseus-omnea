import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";

/**
 * Import your Room files
 */
import { OmneaRoom } from "./rooms/OmneaRoom";
import { ChatRoom } from "./rooms/ChatRoom";

export default Arena({
    getId: () => "Your Colyseus App",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
         gameServer.define("omnea-rooms", OmneaRoom);
         gameServer.define("chat-room", ChatRoom);

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("Server ready!");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */

         const basicAuthMiddleware = basicAuth({
            // list of users and passwords
            users: {
              admin: "admin",
              password:"admin135"
            },
            // sends WWW-Authenticate header, which will prompt the user to fill
            // credentials in
            challenge: true,
          });
        app.use("/colyseus", basicAuthMiddleware,  monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});