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
         * ===========================================
         */
        socket.on("updateload", () => {
            mainGame.startGame(); 
        });

        

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