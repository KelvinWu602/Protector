const GameMode = function () {

    let username_logged_in = "";

    function init(){
        hide();

        document.getElementById("PVP_btn").onclick = () => {
            console.log("Join PVP game!");
            joinGame("/pvp");
        }

        document.getElementById("COOP_attacker_btn").onclick = () => {
            console.log("Join COOP game as attacker!");
            joinGame("/attacker");
        }

        document.getElementById("COOP_dodger_btn").onclick = () => {
            console.log("Join COOP game as dodger!");
            joinGame("/dodger");
        }

        document.getElementById("end-game").onclick = () => {
            hide();
            loading.hide();
            ranking.showRanking();
        }
    }

    function hide() { 
        document.querySelector(".GameModeSelection").style.display = "none";
    }

    function show(username) {
        username_logged_in = username;    
        document.querySelector(".GameModeSelection").style.display = "flex";
    }

    function getLoggedInUser() {
        return username_logged_in;
    }

    /** 
     * Depends on the clicked button (PVP, COOP attacker, COOP dodger) 
     * Call 3 different AJAX request to start/join the game
     * 
     * Once user clicked the button:
     * 1. Show the loading screen
     * 2. Send AJAX request (/pvp, /atttacker, /dodger)
     * 3. If response is success
     *     3.1. Connect the server using WebSocket
     *     3.2. Wait for the startGame event
     *     3.3. Hide the loading screen
     *     3.4. Start the game
     * 4. If response is fail
     *     4.1. Show the error message, hide the loading screen  
    */

    async function joinGame(type) {

        loading.show();
        loading.changeText("Matching you with a player");

        await fetch(type).then(
            res => res.json()
        ).then(json=>{
            if(json.status == "success") {
                //Connect to the server using WebSocket
                console.log("receiving success in response!");
                if(type=="/pvp"){
                    Socket.connect(pvpGame,username_logged_in);
                }else{
                    Socket.connect(coopGame,username_logged_in);
                }
            }else if(json.status == "error"){
                console.log("Error on " + type + " Ajax:"+ json.error);
            }
        }).catch(err=>{
            console.log("Unknown error on " + type + " Ajax");
            //TODO: Show error message
        });
    }
    
    init()

    return{hide,show,getLoggedInUser}

}()