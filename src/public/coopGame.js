const coopGame = function(){
    const ctx = document.getElementById('canvas').getContext('2d');
    //render dimension
    let canvas_height = 1200;
    let canvas_width = 800;
    
    let server_height = 0;
    let server_width = 0;

    let username = "";

    let role = "";

    const key_mapping = {
        w: 1, //attacker control
        s: 2,
        a: 4,
        d: 8
    }
    
    //To be sent to server on every update of movestate
    let moveState = [
        {
            actor : "attacker",
            movestate: 0
        }
    ];
    
    const set_mode = function(r){
        console.log("Set Mode to " + r);
        role = r; 
        moveState[0].actor = r;
    }

    //To be updated by the server "update" event
    let gamestate = undefined;
    
    //To be called by keydown event
    const keydownHandler = (e) => {
        if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d") {
            if (!(moveState[0].movestate & key_mapping[e.key])) {
                moveState[0].movestate += key_mapping[e.key];
                Socket.postInput(moveState);
            }
        }
    };

    //To be called by keyup event
    const keyupHandler = (e) => {
        if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d") {
            if (moveState[0].movestate & key_mapping[e.key]) {
                moveState[0].movestate -= key_mapping[e.key];
                Socket.postInput(moveState);
            }
        }
    };
    
    //Once constructed will be called
    console.log(ctx);

    /**
     * This function is called when socket received "startGame" event from the server
     */
    function startGame(user,serverWidth, serverHeight){

        console.log("START GAME");

        username = user;
        server_height = serverHeight;
        server_width = serverWidth;

        moveState = [
            {
                actor : role,
                movestate: 0
            }
        ];
        gamestate = undefined;

        // set up event listeners
        document.addEventListener('keydown', keydownHandler);
        document.addEventListener("keyup", keyupHandler);
        // document.querySelector("#stopGameTest").addEventListener("click", ()=> {
        //     stopGame(); 
        // });

        //Remove Loading Screen
        loading.hide(); 
        //Show Game Screen
        show();
        //Calls first frame
        draw(); 
    }

    /**
     * This function is called when socket received "gameover" event from the server
     * @param stats users_data.json 
     */
    function stopGame(stats){
        gameIsGoing = false; 

        //remove the Key Event Listeners 
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener("keyup", keyupHandler);

        hide();

        //Show the Stat Screen
        //Server will pass the user stats to the client
        //gamestate is also passed to the ranking page to extract relevant data
        //Stats screen is different based on the gamemode

        //@TODO Dependency issue here, need to restructure the code for higher modularity
        //Modules are interdependent, need to fix this
        ranking.showRanking(stats, gamestate, "pvp");
    }

    /**
     * This function is called when socket received "update" event from the server
     * @param newstate the full description of the current game state
     * 
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
         *    ]
         * }
     */
    function update(newstate){
        gamestate = newstate; 
    }

    /** 
     * Transform rectangle in server canvas to client canvas
     * 
     * @param x : x coordinate of rectangle in server
     * @param y : y coordinate of rectangle in server
     * @param w : width of rectangle in server
     * @param h : height of rectangle in server
     * 
     * @return : an object with x, y, w, h in client canvas
     * 
    */
    function coorShift(serverRect) {
        const {x,y,w,h} = serverRect;
        const serverWH = server_width/server_height;
        const clientWH = canvas_width/canvas_height;

        const clientRect = {};
        //should always render the whole server canvas, 
        //ie, client canvas > server canvas

        if(serverWH >= clientWH){
            clientRect.x = (x/server_width)*canvas_width;
            clientRect.w = (w/server_width)*canvas_width;

            //vertical offset of server canvas in client canvas
            const offset_y = (canvas_height-canvas_width/serverWH)/2;
            clientRect.y = (y/server_height)*canvas_width/serverWH + offset_y;
            clientRect.h = (h/server_height)*canvas_width/serverWH;
        }else{
            clientRect.y = (x/server_height)*canvas_height;
            clientRect.h = (h/server_height)*canvas_height;

            //horizontal offset of server canvas in client canvas
            const offset_x = (canvas_width-canvas_height*serverWH)/2;
            clientRect.x = (x/server_width)*canvas_height*serverWH + offset_x;
            clientRect.w = (w/server_width)*canvas_height*serverWH;
        }

        return clientRect;
    }

    /**
     * @TODO replace the render method with png images
     * 
     */
    function drawCharacter(rect, playerIsMe, role) {
        const {x,y,w,h} = rect;
        if(playerIsMe){
            if(role==="attacker"){
                ctx.fillStyle = "red";
            }else{
                ctx.fillStyle = "orange";
            }
        }else{
            if(role==="attacker"){
                ctx.fillStyle = "blue";
            }else{
                ctx.fillStyle = "black";
            }
        }
        ctx.fillRect(x,y,w,h);
    }

    function draw() {    
        ctx.clearRect(0, 0, canvas_height, canvas_width);
        if(gamestate){
            console.log("gamestate exists");
            for (let player of gamestate.player){
                //Determine color
                let playerIsMe = player.username==username;
                console.log(player.username, username,playerIsMe);

                //Transform server coordinate to client coordinate
                const attacker = coorShift(player.attacker);
                console.log("attacker: ", attacker);
                const dodger = coorShift(player.dodger);
                console.log("dodger: ", dodger);

                //Draw the characters
                drawCharacter(attacker,playerIsMe,"attacker");
                drawCharacter(dodger,playerIsMe,"dodger");
            }
            
            if(!gamestate.gameover){
                window.requestAnimationFrame(draw);
            }
        }else{
            window.requestAnimationFrame(draw);
        }
    }

    //show the game canvas
    function show(){
        document.querySelector(".mainGame").style.display = "block";

        let windowWidth = document.documentElement.clientWidth;
        let windowHeight = document.documentElement.clientHeight; 

        document.querySelector("canvas").width = windowWidth - 40;
        document.querySelector("canvas").height = windowHeight - 40;
    }


    //hide the game canvas
    function hide(){
        document.querySelector(".mainGame").style.display = "none";
    }

    return {draw, startGame, stopGame, update, set_mode}
}()