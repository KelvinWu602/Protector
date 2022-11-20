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