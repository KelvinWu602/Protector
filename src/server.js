const {PVP, COOP} = require('./serverscript/game.js');

const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the express app
const app = express();

app.use(express.static("public"));
app.use(express.json());

// Server states
// Store the (username, sockets) pairs 
const sockets = {};
// Set up 3 Queues for the waiting games
const PVPs = [];    // PVP games with 1 player waiting  
const COOP_ATTACKERs = []; // COOP games with 1 attacker waiting
const COOP_DODGERs = []; // COOP games with 1 dodger waiting
// Store the ongoing games
const ongoingGames = []; 

const loginSession = session({
    secret: "Protector",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(loginSession);

function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the Ajax requests
app.post("/register", (req,res)=>{
    const {username, password} = req.body;
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    
    if(!(username.length > 0 && password.length > 0)){
        res.json({ status: "error", error: "Username and password cannot be empty." });
        return;
    }

    if(!containWordCharsOnly(username)){
        res.json({ status: "error", error: "Username can only consist of letters, numbers and underscore." });
        return;
    }

    if(username in users){
        res.json({ status: "error", error: "Username already exists." });
        return;
    }
    //update the users.json file 
    const hash = bcrypt.hashSync(password, 10);
    users[username] = hash;
    fs.writeFileSync("./data/users.json", JSON.stringify(users,null,"    "));
    //update the users_data.json file
    const users_data = JSON.parse(fs.readFileSync("./data/users_data.json"));
    users_data[username] = {
        pvp : {
            win : 0,
            lose: 0
        },
        coop : {
            highest_point : 0,
        }
    };
    fs.writeFileSync("./data/users_data.json", JSON.stringify(users_data,null,"    "));

    console.log("User registered: " + username + " , " + password);
    res.json({ status: "success" });
});

app.post("/signin", (req,res)=>{
    const {username, password} = req.body;
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    if(!(username in users)){
        res.json({ status: "error", error: "Username does not exist." });
        return;
    }
    //check the password
    if(!bcrypt.compareSync(password, users[username])){
        res.json({ status: "error", error: "Password is incorrect." });
        return;
    }
    //check if the user is already online
    if(req.session.username == username){
        res.json({ status: "error", error: "User is already online." });
        return;
    }
    //set the session
    req.session.username = username;
    console.log("User signed in: " + username );
    res.json({ status: "success" });
});

app.get("/validate", (req,res)=>{
    const users = JSON.parse(fs.readFileSync("./data/users.json"));

    if(req.session.username){
        if(req.session.username in users){
            res.json({ status: "success" });
            console.log("Sign in validated: " + req.session.username );
            req.session.gameid = null;
            return;
        }
        res.json({ status: "error", error: "Please register." });
    }
    res.json({ status: "error", error: "Please log in." });
});

app.get("/signout",(req,res)=>{
    console.log("User signed out: " + req.session.username );
    req.session.username = null;
    res.json({ status: "success" });
});

app.get("/pvp",(req,res)=>{
    console.log("pvp handler. requested user: " + req.session.username );

    //check if the user is online
    if(!req.session.username){
        res.json({ status: "error", error: "Please log in." });
        return;
    }
    //check if the user is registered
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    if(!req.session.username in users){
        res.json({ status: "error", error: "Please register." });
        return;
    }

    //check if the user is already in a game
    if(req.session.gameid){
        res.json({ status: "error", error: "You are already in a game:" + req.session.gameid  });
        return;
    }
    
    console.log("valid request");


    const PLAYERID = req.session.username;
    //check if there is a game waiting
    try{
        if(PVPs.length == 0){
            //randomly generate a game id
            const GAMEID = Math.floor(Math.random() * Math.pow(10,8));
            let pvp_game = PVP(GAMEID);
            pvp_game.addPlayer(PLAYERID);
            PVPs.push(pvp_game);
            req.session.gameid = GAMEID;
            res.json({ status: "success" });
        }else{
            let pvp_game = PVPs[0];
            pvp_game.addPlayer(PLAYERID);
            req.session.gameid = pvp_game.getID();
            res.json({ status: "success" });
        }
        console.log("User " + PLAYERID + " joined a PVP game.");
    }catch(err){
        res.json({ status: "error", error: "Server Error:"+err.message });
    }
});

app.get("/attacker", (req,res)=>{
    //check if the user is online
    if(!req.session.username){
        res.json({ status: "error", error: "Please log in." });
        return;
    }
    //check if the user is registered
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    if(!req.session.username in users){
        res.json({ status: "error", error: "Please register." });
        return;
    }

    //check if the user is already in a game
    if(req.session.gameid){
        res.json({ status: "error", error: "You are already in a game:" + req.session.gameid  });
        return;
    }
    
    const PLAYERID = req.session.username;

    //check if there is a game waiting
    //Note that CODE_DODGERS are games with 1 dodger waiting
    try{
        if(COOP_DODGERs.length == 0){
            //randomly generate a game id
            const GAMEID = Math.floor(Math.random() * Math.pow(10,8));
            let coop_game = COOP(GAMEID);
            coop_game.addPlayer(PLAYERID,"attacker");
            COOP_ATTACKERs.push(coop_game);
            req.session.gameid = GAMEID;
            res.json({ status: "success" });
        }else{
            let coop_game = COOP_DODGERs[0];
            coop_game.addPlayer(PLAYERID,"attacker");
            req.session.gameid = coop_game.getID();
            res.json({ status: "success" });
        }
        console.log("User " + PLAYERID + " joined a COOP game.");
    }catch(err){
        res.json({ status: "error", error: "Server Error:"+err.message });
    }
});

app.get("/dodger", (req,res)=>{
    //check if the user is online
    if(!req.session.username){
        res.json({ status: "error", error: "Please log in." });
        return;
    }
    //check if the user is registered
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    if(!req.session.username in users){
        res.json({ status: "error", error: "Please register." });
        return;
    }

    //check if the user is already in a game
    if(req.session.gameid){
        res.json({ status: "error", error: "You are already in a game:" + req.session.gameid });
        return;
    }
    
    const PLAYERID = req.session.username;

    //check if there is a game waiting
    //Note that CODE_ATTACKERs are games with 1 attacker waiting
    try{
        if(COOP_ATTACKERs.length == 0){
            //randomly generate a game id
            const GAMEID = Math.floor(Math.random() * Math.pow(10,8));
            let coop_game = COOP(GAMEID);
            coop_game.addPlayer(PLAYERID,"dodger");
            COOP_DODGERs.push(coop_game);
            req.session.gameid = GAMEID;
            res.json({ status: "success" });
        }else{
            let coop_game = COOP_ATTACKERs[0];
            coop_game.addPlayer(PLAYERID,"dodger");
            req.session.gameid = coop_game.getID();
            res.json({ status: "success" });
        }
        console.log("User " + PLAYERID + " joined a COOP game.");
    }catch(err){
        res.json({ status: "error", error: "Server Error:"+err.message });
    }
});


// Handle socket connections
const { createServer }  = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);

io.use((socket, next) => {
    loginSession(socket.request, {}, next);
});

io.on("connection", (socket) => {
    let PLAYERID = socket.request.session.username;
    let GAMEID = socket.request.session.gameid;

    console.log("received connection from " + PLAYERID + " in game " + GAMEID);
    sockets[PLAYERID] = socket;
    
    const criteria = (game) => game.getID() == GAMEID;
    
    //check which kind of the game the player is in
    let type = undefined;
    let game = undefined;
    if(!type){
        game = PVPs.find(criteria);
        if(game){
            type = "PVP";
        }
    }
    if(!type){
        game = COOP_ATTACKERs.find(criteria);
        if(game){
            type = "COOP_ATTACKERs";
        }
    } 
    if(!type){
        game = COOP_DODGERs.find(criteria);
        if(game){
            type = "COOP_DODGERs";
        }
    }
    console.log(GAMEID + " is a " + type + " game.");


    if(game){
        if(game.getPlayersID().length==2){    
            //remove the game from waiting list      
            switch(type){
                case "PVP":
                    PVPs.splice(PVPs.indexOf(game),1);
                    break;
                case "COOP_ATTACKERs":
                    COOP_ATTACKERs.splice(COOP_ATTACKERs.indexOf(game),1);
                    break;
                case "COOP_DODGERs":
                    COOP_DODGERs.splice(COOP_DODGERs.indexOf(game),1);
                    break;
            }
                        
            //add the game to ongoing list
            ongoingGames.push(game);

            game.startGame(sockets);
            
            for(let playerID of game.getPlayersID()){
                sockets[playerID].emit("startGame",JSON.stringify({canvasWidth:1200,canvasHeight:800}));
            }
        }else{
            console.log("User " + PLAYERID + " is waiting for 2nd player in "+ type);
        }
    }


    socket.on("input",(commands)=>{
        commands = JSON.parse(commands);

        for(let command of commands){
            game.input(PLAYERID,command.actor,command.movestate);
        }
    });

    socket.on("disconnect",()=>{
        console.log("User " + PLAYERID + " disconnected socket.");
        game.quitPlayer(PLAYERID);
        delete socket.request.session.gameid;
        socket.request.session.save();
        delete sockets[PLAYERID];
        if(game.getPlayersID().length==0){
            ongoingGames.splice(ongoingGames.indexOf(game),1);
            delete game;
        }
    });
});

httpServer.listen(8000, () => {
    console.log("Server is running on port 8000");
});