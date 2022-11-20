const loading = function(){

    const show = function(){
        document.querySelector(".Loading").style.display = "flex";
    }

    const hide = function(){
        document.querySelector(".Loading").style.display = "none";
    }

    const changeText = function(text){
        document.querySelector("#loading-text").textContent = text;
    }

    async function playerMatch(){

        changeText("Matching you with a player");

        //Dummy delay, delete later
        await new Promise(function (resolve) {
            setTimeout(() => resolve("done!"), 500);
        });

        mainGame.startGame(); 
    }

    return{show, hide, changeText, playerMatch}
}();