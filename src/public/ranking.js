const ranking = function () {

    const init = function(){
        document.querySelector(".RankingBody").style.display = "none";
    }

    const showRanking = function(){
        document.querySelector(".RankingBody").style.display = "block";

        let html = `
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

    const playAgain = function(){
        //To do later
        document.querySelector(".RankingBody").style.display = "none";
    }

    return{init , showRanking}
}()