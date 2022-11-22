//const { Socket } = require("socket.io");

const ranking = function () {

    const init = function () {
        document.querySelector(".RankingBodyBig").style.display = "none";
        document.querySelector("#play-again-button").onclick = backToGameMode;
    }

    /**
     * 
     * @param stat          users_data.json from server "gameover" event, see socket.js for details
     * @param gamestate     gamestate object from server "update" event, see socket.js for details
     * @param gamemode      "pvp" or "coop"
     */
    const showRanking = function (stat, gamestate, gamemode) {
        document.querySelector(".RankingBodyBig").style.display = "flex";

        let winner_html = "";
        let loser_html = "";

        //Assuming that the user data looks like this, correct me if wrong
        // "fox": {
        //     "pvp": {
        //         "win": 3,
        //         "lose": 2
        //     },
        //     "coop": {
        //         "highest_point": 0
        //     }
        // },
        // "Saber": {
        //     "pvp": {
        //         "win": 0,
        //         "lose": 0
        //     },
        //     "coop": {
        //         "highest_point": 0
        //     }
        // },

        //Depends on the gamemode, show different info
        if (gamemode == "pvp") {
            // Show the info for this game
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
            winner_html = `
            <div class="Ranking winner">
                <h1>
                    Winner
                </h1>
                <div class="RankingUsername">
                    ${gamestate.winner}
                </div>
                <div class="RankingPoints">
                    <div>
                        Wins: ${winner_pvp_stats.pvp.win}
                    </div>
                    <div>
                        Lose: ${winner_pvp_stats.pvp.lose}
                    </div>
                </div>
            </div>
            `

            loser_html = `
            <div class="Ranking loser">
                <h1>
                    Loser
                </h1>
                <div class="RankingUsername">
                    ${gamestate.loser}
                </div>
                <div class="RankingPoints">
                    <div>
                        Wins: ${loser_pvp_stats.pvp.win}
                    </div>
                    <div>
                        Lose: ${loser_pvp_stats.pvp.lose}
                    </div>
                </div>
            </div>
            `

        } else if (gamemode == "coop") {
            // Show the info for this game
            // Attacker's username and highest_point
            // Dodger's username and highest_point
            const attacker = gamestate.player.attacker.username;
            const dodger = gamestate.player.dodger.username;

            const attacker_highest_point = stat[attacker].coop.highest_point;
            const dodger_highest_point = stat[dodger].coop.highest_point;

            /**
             * @TODO Construct the html contents
             * COMPLETED: Comment lines below when ready
             */
            //In Coop, there is no "winner" or "loser"
            //But still render winner_html and loser_html just to maintain order
            winner_html = `
             <div class="Ranking">
                 <h1>
                     Attacker
                 </h1>
                 <div class="RankingUsername">
                     ${attacker}
                 </div>
                 <div class="RankingPoints">
                     <div>
                         High Score: ${attacker_highest_point}
                     </div>
                 </div>
             </div>
             `

            loser_html = `
             <div class="Ranking">
                 <h1>
                     Loser
                 </h1>
                 <div class="RankingUsername">
                     ${dodger}
                 </div>
                 <div class="RankingPoints">
                     <div>
                        High Score: ${dodger_highest_point}
                     </div>
                 </div>
             </div>
             `
        }

        //=========================
        //COMMENT ALL LINES BELOW WHEN READY FOR TESTING
        //=========================
        winner_html = `
        <div class="Ranking winner">
            <h1>
                Winner
            </h1>
            <div class="RankingUsername">
                Saber Athena
            </div>
            <div class="RankingPoints">
                <div>
                    Wins: 23
                </div>
                <div>
                    Lose: 21
                </div>
            </div>
        </div>
        `

        loser_html = `
        <div class="Ranking loser">
            <h1>
                Loser
            </h1>
            <div class="RankingUsername">
                Cherno Alpha
            </div>
            <div class="RankingPoints">
                <div>
                    Wins: 23
                </div>
                <div>
                    Lose: 21
                </div>
            </div>
        </div>
        `
        //=========================
        //COMMENT ALL LINES ABOVE WHEN READY FOR TESTING
        //=========================
    
        //Overwriting the previous HTML
        document.querySelector(".RankingBody").innerHTML = `<div id="ranking-head"></div>`;

        document.getElementById("ranking-head").insertAdjacentHTML("afterend", loser_html);
        document.getElementById("ranking-head").insertAdjacentHTML("afterend", winner_html);
    }

    //Listener: Fired when click play again
    //Should return to GameMode screen allow player to choose gamemode again
    const backToGameMode = function () {
        document.querySelector(".RankingBodyBig").style.display = "none";
        //Socket.disconnect();
        GameMode.show(GameMode.getLoggedInUser());
    }

    init();

    return { init, showRanking }
}()