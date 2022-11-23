const {MOVESTATE, Attacker, Dodger} = require('./player.js');
const {Enemy} = require('./enemy.js');
const {Item} = require('./item.js');
const fs = require("fs");

const FPS = 30;

//Each game has a unique ID
const PVP = function(ID){
    //Store the player IDs
    const players = [];
    //Check if the game is over
    let gamestate = {
        gameover: false,
        winner: undefined,
        speed: 4,
        player: [
            {
                //ID,
                attacker : {
                    //obj,
                    movestate: MOVESTATE.STILL,
                },
                dodger : {
                    //obj,
                    movestate: MOVESTATE.STILL,
                }
            },
            {
                attacker : {
                    movestate: MOVESTATE.STILL,
                },
                dodger : {
                    movestate: MOVESTATE.STILL,
                }
            }
        ],
        HPItem: [],
        shieldItem: []
    };

    //Add a playerID to the game when receiving a PVP event
    const addPlayer = (playerID)=>{
        players.push(playerID);
    }

    const quitPlayer = (playerID)=>{
        //delete the player
        players.splice(players.indexOf(playerID),1);
        //terminate the game if there is only one player left
        gamestate.gameover = true;
    }

    const getPlayersID = ()=>{
        return players;
    }

    const startGame = (sockets)=>{
        if(players.length<2) return;

        // Initialize the game
        // Canvas size: (1200,800)
        // Player 0 : attacker position (275,175)
        // Player 0 : dodger position (275,575)
        // Player 1 : attacker position (875,575)
        // Player 1 : dodger position (875,175)

        //register player ID
        gamestate.player[0].ID = players[0];
        gamestate.player[1].ID = players[1];
            
        //initialize the attacker
        gamestate.player[0].attacker.obj = Attacker(275,175,gamestate);
        //initialize the dodger
        gamestate.player[0].dodger.obj = Dodger(275,575,gamestate);

        //initialize the attacker
        gamestate.player[1].attacker.obj = Attacker(875,575,gamestate);
        //initialize the dodger
        gamestate.player[1].dodger.obj = Dodger(875,175,gamestate);

        //initialize the HP item
        gamestate.HPItem.push(Item("HP",25,25,10000,5000)); //appear for 10s, disappear for 5s
        gamestate.HPItem.push(Item("HP",25,25,10000,3000)); //appear for 10s, disappear for 3s

        //initialize the shield item
        gamestate.shieldItem.push(Item("Shield",50,50,5000,5000)); //appear for 5s, disappear for 5s

        let frames = 0;
        // start 60 frames per second
        let gameTimer = setInterval(()=>{
            if(gamestate.gameover) {
                clearInterval(gameTimer);
                //call gameOver function
                gameOver(sockets);
                return;
            }
            update(sockets);
            // The moving speed increases for every 20 seconds
            frames++;
            if(frames%(20*FPS)==0){
                gamestate.speed += 5;
                console.log("20 secs");
            }
        },1000/FPS);
    }

    //callback to be called when received a key event from a player
    const input = (playerID,type,movestate)=>{
        //check if the game is over
        if(gamestate.gameover) return;
        //check if the player is in the game
        if(players.indexOf(playerID)==-1) return;

        //update the game state
        gamestate.player[players.indexOf(playerID)][type].movestate = movestate;
    }

    const update = (sockets)=>{
        //update players position
        for(let i = 0 ; i < players.length ; i++){
            let playeri = gamestate.player[i];
            
            //update attacker
            if(playeri.attacker.movestate != MOVESTATE.STILL){
                playeri.attacker.obj.getPlayer().update(playeri.attacker.movestate);
            }

            //update dodger
            if(playeri.dodger.movestate != MOVESTATE.STILL){
                playeri.dodger.obj.getPlayer().update(playeri.dodger.movestate);
            }
        }

        //update HP item
        for(let HPItem of gamestate.HPItem){
            //check if expired
            HPItem.update();
            //check if collected
            for(let i = 0 ; i < players.length ; i++){
                let playeri = gamestate.player[i];
                HPItem.checkCollected(playeri.attacker.obj.getPlayer().getEdge(),playeri.dodger.obj.addLife);
                HPItem.checkCollected(playeri.dodger.obj.getPlayer().getEdge(),playeri.dodger.obj.addLife);
            }
        }

        //update shield item
        for(let shieldItem of gamestate.shieldItem){
            //check if expired
            shieldItem.update();
            //check if collected
            for(let i = 0 ; i < players.length ; i++){
                let playeri = gamestate.player[i];
                shieldItem.checkCollected(playeri.attacker.obj.getPlayer().getEdge(),playeri.dodger.obj.addShield);
                shieldItem.checkCollected(playeri.dodger.obj.getPlayer().getEdge(),playeri.dodger.obj.addShield);
            }
        }

        //check gameover
        isOver();

        //prepare the game state to be sent to the client
        const attackedge0 = gamestate.player[0].attacker.obj.getPlayer().getEdge();
        const dodgeedge0 = gamestate.player[0].dodger.obj.getPlayer().getEdge();
        const attackedge1 = gamestate.player[1].attacker.obj.getPlayer().getEdge();
        const dodgeedge1 = gamestate.player[1].dodger.obj.getPlayer().getEdge();
        
        
        const gamestateToSend = {
            gameover: gamestate.gameover,
            winner: gamestate.winner,
            player: [
                { 
                    username:players[0],
                    life: gamestate.player[0].dodger.obj.getLife(),
                    shielded: gamestate.player[0].dodger.obj.getShielded(),
                    attacker : {
                        ...attackedge0.getXY(),
                        ...attackedge0.getWH()
                    },
                    dodger : {
                        ...dodgeedge0.getXY(),
                        ...dodgeedge0.getWH()
                    }
                },
                {
                    username:players[1],
                    life: gamestate.player[1].dodger.obj.getLife(),
                    shielded: gamestate.player[1].dodger.obj.getShielded(),
                    attacker : {
                        ...attackedge1.getXY(),
                        ...attackedge1.getWH()
                    },
                    dodger : {
                        ...dodgeedge1.getXY(),
                        ...dodgeedge1.getWH()
                    }
                }    
            ],
            HPItem: [],
            shieldItem: []
        }

        //append the HPItem data
        for(let item of gamestate.HPItem){
            gamestateToSend.HPItem.push(item.getState());
        }

        //append the ShieldItem data
        for(let item of gamestate.shieldItem){
            gamestateToSend.shieldItem.push(item.getState());
        }

        //send the game state to the client
        sockets[players[0]].emit('update',JSON.stringify(gamestateToSend));
        sockets[players[1]].emit('update',JSON.stringify(gamestateToSend));
    }

    const isOver = ()=>{
        //check if any player's dodger is touched by the attacker
        if(gamestate.player[0].dodger.obj.getPlayer().getEdge()
        .collideWith(gamestate.player[1].attacker.obj.getPlayer().getEdge()))
        {
            gamestate.player[0].dodger.obj.damaged();
            //check how many lives the dodger has
            if(gamestate.player[0].dodger.obj.getLife()<=0){
                gamestate.gameover = true;
                gamestate.winner = players[1];
            }
        }

        if(gamestate.player[1].dodger.obj.getPlayer().getEdge()
        .collideWith(gamestate.player[0].attacker.obj.getPlayer().getEdge()))
        {
            gamestate.player[1].dodger.obj.damaged();
            //check how many lives the dodger has
            if(gamestate.player[1].dodger.obj.getLife()<=0){
                gamestate.gameover = true;
                gamestate.winner = players[0];
            }
        }
    }

    const gameOver = (sockets)=>{
        //update users_data.json
        const users_data = JSON.parse(fs.readFileSync('data/users_data.json'));
        if(gamestate.winner == players[0]){
            users_data[players[0]].pvp.win ++;
            users_data[players[1]].pvp.lose ++;
        }else{
            users_data[players[0]].pvp.lose ++;
            users_data[players[1]].pvp.win ++;
        }
        fs.writeFileSync('data/users_data.json',JSON.stringify(users_data,null,"    "));
        console.log(ID + " is over and read users_data is updated");

        //send gameover to the client
        sockets[players[0]].emit('gameover',JSON.stringify(users_data));
        sockets[players[1]].emit('gameover',JSON.stringify(users_data));
    }

    const getID = ()=>{
        return ID;
    }

    const getState = ()=>{
        return gamestate;
    }

    return {addPlayer,quitPlayer,getPlayersID,startGame,update,input,getID,getState}; 
};

//Each game has a unique ID
const COOP = function(ID){
    const NUMOFENEMIES = 5;
    //Store the player IDs
    const players = [];
    //Check if the game is over
    let gamestate = {
        gameover: false,
        point: 0,
        speed: 4,
        player:{
            attacker : {
                //ID,
                //obj,
                movestate: MOVESTATE.STILL,
            },
            dodger : {
                //ID,
                //obj,
                movestate: MOVESTATE.STILL,
            }
        },
        enemies: [],
        HPItem: [],
        shieldItem: []
    };

    //Add a playerID to the game when receiving a PVP event
    const addPlayer = (playerID,role)=>{
        players.push(playerID);
        gamestate.player[role].ID = playerID;
    }

    const quitPlayer = (playerID)=>{
        //delete the player
        players.splice(players.indexOf(playerID),1);
        //terminate the game if there is only one player left
        gamestate.gameover = true;
    }

    const getPlayersID = ()=>{
        return players;
    }

    const startGame = (sockets)=>{
        if(players.length<2) return;

        // Initialize the game
        // Canvas size: (1200,800)
        // attacker position (275,375)
        // dodger position (875,375)
            
        //initialize the attacker
        gamestate.player.attacker.obj = Attacker(275,375,gamestate);
        //initialize the dodger
        gamestate.player.dodger.obj = Dodger(875,375,gamestate);
        //initialize the enemies
        for(let i = 0 ; i < NUMOFENEMIES; i++){
            //initial position is in the range of x:(-400,1600) to (-200,1000)
            gamestate.enemies.push(Enemy(i,-400+Math.floor(Math.random()*2000),-200+Math.floor(Math.random()*1200),gamestate));
        }
        //initialize the HPItem
        gamestate.HPItem.push(Item("HP",25,25,5000,10000));
        gamestate.HPItem.push(Item("HP",25,25,3000,10000));
        //initialize the shieldItem
        gamestate.shieldItem.push(Item("Shield",50,50,5000,5000));
        
        let levelscore = 10;

        // start 30 frames per second
        let gameTimer = setInterval(()=>{
            if(gamestate.gameover) {
                clearInterval(gameTimer);
                //call gameover function
                gameOver(sockets);
                return;
            }
            update(sockets);
            //increase the speed of the game
            if(gamestate.point >= levelscore){
                levelscore += 10;
                gamestate.speed += 1;
            }
        },1000/FPS);
    }

    //callback to be called when received a key event from a player
    const input = (playerID,type,movestate)=>{
        //check if the game is over
        if(gamestate.gameover) return;
        //check if the player is in the game
        if(players.indexOf(playerID)==-1) return;
        //check if the player is playing his own type
        if(gamestate.player[type].ID != playerID) return;

        //update the game state
        gamestate.player[type].movestate = movestate;
    }

    const update = (sockets)=>{
        //update players position
        if(gamestate.player.attacker.movestate != MOVESTATE.STILL){
            gamestate.player.attacker.obj.getPlayer().update(gamestate.player.attacker.movestate);
        }
        if(gamestate.player.dodger.movestate != MOVESTATE.STILL){
            gamestate.player.dodger.obj.getPlayer().update(gamestate.player.dodger.movestate);
        }

        //update HP item
        for(let HPItem of gamestate.HPItem){
            //check if expired
            HPItem.update();
            //check if collected
            HPItem.checkCollected(gamestate.player.attacker.obj.getPlayer().getEdge(),gamestate.player.dodger.obj.addLife);
            HPItem.checkCollected(gamestate.player.dodger.obj.getPlayer().getEdge(),gamestate.player.dodger.obj.addLife);
        }

        //update shield item
        for(let shieldItem of gamestate.shieldItem){
            //check if expired
            shieldItem.update();
            //check if collected
            shieldItem.checkCollected(gamestate.player.attacker.obj.getPlayer().getEdge(),gamestate.player.dodger.obj.addShield);
            shieldItem.checkCollected(gamestate.player.dodger.obj.getPlayer().getEdge(),gamestate.player.dodger.obj.addShield);
        }

        //update enemies position
        for(let i = 0 ; i < NUMOFENEMIES; i++){
            gamestate.enemies[i].update(gamestate.player.attacker.obj,gamestate.player.dodger.obj);
            if(!gamestate.enemies[i].isAlive()){
                gamestate.point++;
                //random initial position
                //x: [-400,0] or [1200,1600]
                const enemyx = -400+Math.floor(Math.random()*400) + Math.round(Math.random())*1600;
                //y: [-200,0] or [800,1000]
                const enemyy = -200+Math.floor(Math.random()*200) + Math.round(Math.random())*1000;
                gamestate.enemies[i].reborn(enemyx,enemyy);
            }
        }
        
        //check gameover
        if(gamestate.player.dodger.obj.getLife()<=0){
            gamestate.gameover = true;
        }

        //prepare the game state to be sent to the client
        const attackedge = gamestate.player.attacker.obj.getPlayer().getEdge();
        const dodgeedge = gamestate.player.dodger.obj.getPlayer().getEdge();
        const gamestateToSend = {
            gameover: gamestate.gameover,
            point: gamestate.point,
            player: { 
                life: gamestate.player.dodger.obj.getLife(),
                shielded: gamestate.player.dodger.obj.getShielded(),
                attacker : {
                    username: gamestate.player.attacker.ID,
                    ...attackedge.getXY(),
                    ...attackedge.getWH()
                },
                dodger : {
                    username: gamestate.player.dodger.ID,
                    ...dodgeedge.getXY(),
                    ...dodgeedge.getWH()
                }
            },
            enemies: [],
            HPItem: [],
            shieldItem: []
        }
        for(let i = 0 ; i < NUMOFENEMIES; i++){
            gamestateToSend.enemies.push({
                ID: gamestate.enemies[i].getID(),
                ...gamestate.enemies[i].getEdge().getXY(),
                ...gamestate.enemies[i].getEdge().getWH()
            });
        }
        for(let item of gamestate.HPItem){
            gamestateToSend.HPItem.push(item.getState());
        }
        for(let item of gamestate.shieldItem){
            gamestateToSend.shieldItem.push(item.getState());
        }
        //send the game state to the client
        sockets[players[0]].emit('update',JSON.stringify(gamestateToSend));
        sockets[players[1]].emit('update',JSON.stringify(gamestateToSend));
    }

    const gameOver = (sockets)=>{
        //update users_data.json
        const users_data = JSON.parse(fs.readFileSync('data/users_data.json'));
        for(let i = 0 ; i < 2 ; i++){
            if(users_data[players[i]].coop.highest_point < gamestate.point){
                users_data[players[i]].coop.highest_point = gamestate.point;
            }
        }
        fs.writeFileSync('data/users_data.json',JSON.stringify(users_data,null,"    "));
        console.log(ID + " is over and read users_data is updated");

        //send gameover to the client
        sockets[players[0]].emit('gameover',JSON.stringify(users_data));
        sockets[players[1]].emit('gameover',JSON.stringify(users_data));
    }

    const getID = ()=>{
        return ID;
    }

    const getState = ()=>{
        return gamestate;
    }

    return {addPlayer,quitPlayer,getPlayersID,startGame,update,input,getID,getState}; 
};

module.exports = {PVP,COOP};