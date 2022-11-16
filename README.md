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
