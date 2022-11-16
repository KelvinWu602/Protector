# Protector
Course project for Internet Computing

This is a simple 2-player game which has 2 modes: PVP and COOP.

## PVP mode: 
You need to control your knight to protect your dearest princess, while your opponent is doing the same thing!

**Princess Dodge! Knight, kill opponent's princess! Only if so will opponent's knight be upset and loses!**

## COOP mode:
You need to cooperate with another player, each controlling either knight or princess. 

**Your goal is to stay alive, and kill as many bad guys as possible!**

Sounds simple, but not so simple when you play it ;)

## Directory 

|-- documentation\
|====|--login_api.svg : API for login procedures\
|====|--PVP_flow.svg : API for PVP mode\
|-- src\
|====|--data \
|=========|--users.json : stores the username, password pairs for registered users\
|====|--public : the static files that serves the frontend\
|====|--serverscript : javascript modules that compose the game logic\
|=========|--box.js : define the position and dimension of an entity, check distance and collision\
|=========|--player.js : define the response on move states, wrapped with Attacker and Dodger\
|=========|--enemy.js : define the enemy behavior\
|=========|--game.js : define the game logic, encapsulated by PVP and COOP\
|====|--server.js : the main server script, with AJAX and Websocket handlers defined\

## Server Logic

Each server instance maintain 3 queues and 1 array.
Three queues are used for storing game objects that have not started yet, i.e., waiting for the 2nd player:
1. PVP games
2. COOP games, where the waiting player plays attacker (knight)
3. COOP games, where the waiting player plays dodger (princess)

The one array is used for storing game objects that have started already, we call it *ongoinggames*.

The server requires players to sign in before they join any game, thus the following AJAX handlers are supported:
1. register
2. signin
3. validate
4. signout

After signed in, the server will create a session for the player, the session will store:
1. username (which is, Player ID)

The server has 3 AJAX handlers for players to join a game:
1. pvp, for joining PVP games
2. attacker, for joining COOP games and playing attacker
3. dodger, for joining COOP games and playing dodger

If there is a game waiting for you to join, you will join the game and it will start right away.\
If there is no game waiting for you to join, the server will create a new game and wait for the 2nd player to join.

Each game object is associated with an unique GAMEID, which is stored in players' session cookies for server to recognise which game is the player playing.

Once the game is initialized, the server will send you a "startGame" event, noticing the browser that it is ready for control events.

During the game, the server will send you "update" events and tell the browser where to render the objects.
The browser will inform the server with "input" events that certain keys are pressed down or released.

Once gameover, the server will change the "gameover" flag in the "update" socket message data, and wait for browsers to disconnect.
Once both browsers have disconnected, the game object and the GAMEID stored in players' session will be deleted.
