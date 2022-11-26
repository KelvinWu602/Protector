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

    const connect = function(mainGame,username) {
        console.log("socket connect...");

        socket = io();

        /**
         * When the player is matched up and the game is ready
         * the server will send the "server's canvas" dimension to the client
         */
        socket.on("startGame", (message) => {
            console.log("received startGame event");
            const {canvasWidth, canvasHeight} = JSON.parse(message);
            mainGame.startGame(username,canvasWidth,canvasHeight); 
        });

    
        /**
         * ===========================================
         * TODO: Send a socket message of "update"
         * 
         * Data expected depends on the game mode.
         * 
         * For PVP:
         * Each player has a pair of attacker and dodger, ie, 4 objects in total
         * 
         * const gamestate = {
         *    gameover,               //boolean: true if game is over
         *    winner,                 //string: username of winner, undefined if the game is not over   
         *    player: [
         *      {
         *          username,                 //string: username of player 1
         *          attacker: {x,y,w,h}       //rectangle: attacker's position
         *          dodger: {x,y,w,h}         //rectangle: dodger's position
         *      },
         *      {
         *          username,                 //string: username of player 2
         *          attacker: {x,y,w,h}       //rectangle: attacker's position
         *          dodger: {x,y,w,h}         //rectangle: dodger's position
         *      }  
         *    ],
         *    HPItem: [
         *      {
         *          render,                   //boolean: only render this item if render == true
         *          x,y,w,h                   //rectangle: item's position
         *      }, ... (can contains multiple items)
         *    ],
         *    shieldItem: [
         *      {
         *          render,                   //boolean: only render this item if render == true
         *          x,y,w,h                   //rectangle: item's position
         *      }, ... (can contains multiple items)
         *    ]
         * }
         * 
         * For COOP:
         * Each player controls either attacker or dodger, plus 5 AI enemies, ie, 7 objects in total
         * 
         * const gamestate = {
         *    gameover,               //boolean: true if game is over
         *    point,                  //int: number of enemies they have killed 
         *    player: {
         *          attacker: {
         *              username,     //string: username of player 1
         *              x,            //int: x position of attacker
         *              y,            //int: y position of attacker
         *              w,            //int: width of attacker
         *              h             //int: height of attacker
         *          }       
         *          dodger: {
         *              username,     //similar as above
         *              x,
         *              y,
         *              w,
         *              h
         *          }         
         *    },
         *    HPItem: [
         *      {
         *          render,                   //boolean: only render this item if render == true
         *          x,y,w,h                   //rectangle: item's position
         *      }, ... (can contains multiple items)
         *    ],
         *    shieldItem: [
         *      {
         *          render,                   //boolean: only render this item if render == true
         *          x,y,w,h                   //rectangle: item's position
         *      }, ... (can contains multiple items)
         *    ]
         * }
         * 
         * 
         * The canvas will loop through this array and draw every object
         * ===========================================
         */
        socket.on("update", (state)=> {
            let newstate = JSON.parse(state);
            // console.log("update: " + state);
            mainGame.update(newstate);
        });
    
        /**
         * When the game is over, the server will emit the gameover event AFTER sending the last update event with gamestate.gameover==true
         * @param stats users_data.json
         * 
         * 
         * stats = {
         *    username: {
         *      pvp: {
         *         win,     //int: total number of wins in pvp
         *         lose     //int: total number of loses in pvp
         *      },
         *      coop: {  
         *          highest_point,     //int: highest point in coop mode
         *      }
         *    }
         * }
         * 
         * 
         * 
         */
        socket.on("gameover",(stats)=>{
            stats = JSON.parse(stats);
            mainGame.stopGame(stats);
        })
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        console.log("socket disconnect...");
        socket.disconnect();
        socket = null;
    };

    const postInput = (input) => {
        console.log("Socket: " + JSON.stringify(input));
        if (socket && socket.connected) {
            socket.emit("input", JSON.stringify(input));
        }
    }

    const postCheat = () => {
        console.log("Post Cheat");
        socket.emit("cheat", "");
    }

    // // This function sends a post message event to the server
    // const postMessage = function(content) {
    //     if (socket && socket.connected) {
    //         socket.emit("post message", content);
    //     }
    // };

    

    return { getSocket, connect, disconnect, postInput, postCheat };
}());