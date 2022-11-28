const pvpGame = function() {
    const ctx = document.getElementById('canvas').getContext('2d');
    //render dimension
    let canvas_height = 1200;
    let canvas_width = 800;
    
    let server_height = 0;
    let server_width = 0;

    let username = "";

    let previous_life = undefined; 
    let previous_shielded = undefined;

    const key_mapping = {
        w: 1, //attacker control
        s: 2,
        a: 4,
        d: 8,
        i: 1, //dodger control
        k: 2,
        j: 4,
        l: 8,
    }
    
    const attacker_img = new Image();
    const dodger_img = new Image();
    const shield_img = new Image();
    const hp_img = new Image();

    //To be sent to server on every update of movestate
    let moveState = [
        {
            actor : "attacker",
            movestate: 0
        },
        {
            actor : "dodger",
            movestate: 0
        }
    ];

    //To be updated by the server "update" event
    let gamestate = undefined;
    
    //To be called by keydown event
    const keydownHandler = (e) => {
        if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d") {
            if (!(moveState[0].movestate & key_mapping[e.key])) {
                moveState[0].movestate += key_mapping[e.key];
                Socket.postInput(moveState);
            }
        }else if(e.key === "i" || e.key === "k" || e.key === "j" || e.key === "l") {
            if (!(moveState[1].movestate & key_mapping[e.key])) {
                moveState[1].movestate += key_mapping[e.key];
                Socket.postInput(moveState);
            }
        }else if(e.key === " ") {
            Socket.postCheat();
        }
    };

    //To be called by keyup event
    const keyupHandler = (e) => {
        if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d") {
            if (moveState[0].movestate & key_mapping[e.key]) {
                moveState[0].movestate -= key_mapping[e.key];
                Socket.postInput(moveState);
            }
        }else if(e.key === "i" || e.key === "k" || e.key === "j" || e.key === "l") {
            if (moveState[1].movestate & key_mapping[e.key]) {
                moveState[1].movestate -= key_mapping[e.key];
                Socket.postInput(moveState);
            }
        }
    };
    
    //Once constructed will be called
    console.log(ctx);

    function loadImage(img,src){
        img.src = src;
        return img.decode()
    }

    async function loadAllImages(){
        await loadImage(attacker_img,"/assets/attacker.png");
        await loadImage(dodger_img,"/assets/dodger.png");
        await loadImage(shield_img,"/assets/shield.png");
        await loadImage(hp_img,"/assets/hp.png");
    }

    
    /**
     * This function is called when socket received "startGame" event from the server
     */
    function startGame(user,serverWidth, serverHeight){
        //stop bgm
        sounds.bgm.pause();
        sounds.bgm.currentTime = 0;
        //play game bgm
        sounds.ingame.play();

        username = user;
        server_height = serverHeight;
        server_width = serverWidth;

        moveState = [
            {
                actor : "attacker",
                movestate: 0
            },
            {
                actor : "dodger",
                movestate: 0
            }
        ];
        gamestate = undefined;

        loadAllImages().then(()=>{
            console.log("Start Game!");
            // set up event listeners
            document.addEventListener('keydown', keydownHandler);
            document.addEventListener("keyup", keyupHandler);
        
            //Remove Loading Screen
            loading.hide(); 
            //Show Game Screen
            show();
            //Calls first frame
            draw(); 
        });
    }

    /**
     * This function is called when socket received "gameover" event from the server
     * @param stats users_data.json 
     */
    function stopGame(stats){
        sounds.ingame.pause();
        sounds.ingame.currentTime = 0;

        gameIsGoing = false;

        //remove the Key Event Listeners 
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener("keyup", keyupHandler);

        hide();

        Socket.disconnect();

        if(gamestate.winner == username){ 
            sounds.win.play()
        }else {
            sounds.lose.play();
        }
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

        console.log(canvas_width,canvas_height);

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
            clientRect.y = (y/server_height)*canvas_height;
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
        // if(playerIsMe){
        if(role=="attacker"){
            ctx.textAlign = "center";
            ctx.textBaseLine = "middle";
            ctx.strokeText(playerIsMe?"P1":"P2",x+w/2,y-h/2);
            ctx.drawImage(attacker_img,x,y,w,h)
        }else if(role=="dodger"){
            ctx.textAlign = "center";
            ctx.textBaseLine = "middle";
            ctx.strokeText(playerIsMe?"P1":"P2",x+w/2,y-h/2);
            ctx.drawImage(dodger_img,x,y,w,h)
        } else if (role == "hp") {
            ctx.drawImage(hp_img,x,y,w,h)
        } else if (role == "shield") {
            ctx.drawImage(shield_img,x,y,w,h)
        }
       
    }

    function draw() {    
        let windowWidth = document.documentElement.clientWidth;
        let windowHeight = document.documentElement.clientHeight;

        canvas_height = windowHeight - 140;
        canvas_width = windowWidth - 40;

        document.querySelector("canvas").width = windowWidth - 40;
        document.querySelector("canvas").height = windowHeight - 140;

        ctx.clearRect(0, 0, canvas_width, canvas_height);
        if(gamestate){
            //console.log("gamestate exists");
            for (let player of gamestate.player){
                //Determine color
                let playerIsMe = player.username==username;
                //console.log(player.username, username,playerIsMe);
                if(playerIsMe){
                    //update the top bar
                    if(player.life != previous_life){
                        document.getElementById("stat-life-box").textContent = player.life;
                        previous_life = player.life;
                    }
        
                    if(gamestate.player.shielded != previous_shielded){
                        document.getElementById("stat-shield-box").textContent = player.shielded? "shield" : "no shield";
                        previous_shielded = player.shielded;
                    }
                }

                //Transform server coordinate to client coordinate
                const attacker = coorShift(player.attacker);
                console.log("attacker: ", attacker);
                const dodger = coorShift(player.dodger);
                console.log("dodger: ", dodger);

                //Draw the characters
                drawCharacter(attacker,playerIsMe,"attacker");
                drawCharacter(dodger,playerIsMe,"dodger");
            }

            for (const hp of gamestate.HPItem) {
                if (hp.render) {
                    drawCharacter(coorShift(hp),true,"hp");
                }
            }

            for (const s of gamestate.shieldItem) {
                if (s.render) {
                    drawCharacter(coorShift(s),true,"shield");
                }
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

    return {draw, startGame, stopGame, update}
}();