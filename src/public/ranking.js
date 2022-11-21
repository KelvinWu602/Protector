const { Socket } = require("socket.io");

const ranking = function () {

    const init = function(){
        document.querySelector(".RankingBody").style.display = "none";
        document.querySelector("#play-again-button").onclick = backToGameMode;
    }

    /**
     * 
     * @param stat          users_data.json from server "gameover" event, see socket.js for details
     * @param gamestate     gamestate object from server "update" event, see socket.js for details
     * @param gamemode      "pvp" or "coop"
     */
    const showRanking = function(stat, gamestate, gamemode){
        document.querySelector(".RankingBody").style.display = "block";

        let html = "";

        //Depends on the gamemode, show different info
        if(gamemode == "pvp"){
            //Show the info for this game
            // Winner's username
            // Winner's pvp stats {win, lose}
            // Loser's pvp stats {win, lose}
            const winner = gamestate.winner;
            const loser = gamestate.player[0].username == winner ? gamestate.player[1].username : gamestate.player[0].username;

            const winner_pvp_stats = stat[winner].pvp;
            const loser_pvp_stats = stat[loser].pvp;

            /**
             * @TODO Construct the html contents
             */
            html = "";

        }else if(gamemode == "coop"){
            //Show the info for this game
            // Attacker's username and highest_point
            // Dodger's username and highest_point
            const attacker = gamestate.player.attacker.username;
            const dodger = gamestate.player.dodger.username;

            const attacker_highest_point = stat[attacker].coop.highest_point;
            const dodger_highest_point = stat[dodger].coop.highest_point;

            /**
             * @TODO Construct the html contents
             */
            html = "";
        }

        //Delete after filling above
        html = `
        <div class = "Ranking">
            <div class = "RankingUsername">
                Fox Lee
            </div>
            <div class = "RankingPoints">
                123
            </div>
        </div>
        <div class = "Ranking">
            <div class = "RankingUsername">
                Kelvin Wu
            </div>
            <div class = "RankingPoints">
                456
            </div>
        </div>
        `

        document.getElementById("ranking-head").insertAdjacentHTML("afterend", html); 
    }

    //Should return to GameMode screen allow player to choose gamemode again
    const backToGameMode = function(){
        document.querySelector(".RankingBody").style.display = "none";
        Socket.disconnect();
        GameMode.show(GameMode.getLoggedInUser());
    }

    init();

    return{init , showRanking}
}()