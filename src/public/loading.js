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

    return{show, hide, changeText}
}();