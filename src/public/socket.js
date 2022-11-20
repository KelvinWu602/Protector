/**
 * Acknowledgment: This code is taken and modified from the COMP 4021 LAB 5-6
 */

const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    const connect = function() {
        socket = io();

        /**
         * When the player is matched up and the game is ready
         */
        socket.on("startsame", () => {
            mainGame.startGame(); 
        });

        /**
         * ===========================================
         * TODO: Add a new socket connection in the backend
         * 
         * This TODO is optional, but if you would want the player to know something during the loading
         * Example: Currently matching you up with another person
         * Use this function to update the loading screen text
         * 
         * If the screen is not currently being shown, nothing will happen
         * 
         * When finished changing the backend, just delete this TODO. Nothing to do here. 
         * ===========================================
         */
        socket.on("updateload", () => {
            mainGame.startGame(); 
        });

        /**
         * ===========================================
         * TODO: Send a socket message of "update"
         * 
         * Data expected is a Array of the following object. 
         * If only one object, still wrap in an array
         * 
         * {
         *  username: string; 
         *  role: "Attacker" | "Dodger";    //Feel free to add more role here
         *  position: {
         *      x: number; 
         *      y: number;
         *  };
         *  size: {
         *      x: number;
         *      y: number;
         *  }
         * }
         * 
         * The canvas will loop through this array and draw every object
         * ===========================================
         */
        socket.on("update", (pos)=> {
            let position = JSON.parse(pos);
            mainGame.update(pos);
        })
        

    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    const postInput = (input) => {
        console.log("Socket: " + input);
        if (socket && socket.connected) {
            socket.emit("input", input);
        }
    }

    return { getSocket, connect, disconnect, postMessage, postInput };
})();