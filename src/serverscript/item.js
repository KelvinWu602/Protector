const {Box} = require('./box.js');
// x, y : location of the item
// duration: how long the item will last in ms
module.exports.Item = function(type,w,h,duration,rebornInterval) {
    let x = Math.floor(Math.random()*1200); //canvas width
    let y = Math.floor(Math.random()*800);  //canvas height
    const edge = Box(x,y,w,h);
    let birthtime = Date.now();
    
    //expired=true means: 
    //1. After duration, it is not collected
    //2. During duration, it is collected
    let expired = false;
    //waitingForReborn = true means:
    //if reborn is called, it will be reborn
    let waitingForReborn = true;

    const getEdge = () => {
        return edge;
    }
    
    const getType = () => {
        return type;
    }

    //called for each player rectangle for every frame
    const checkCollected = (playerRect, collectHandler) => {
        if(!expired){
            if(edge.collideWith(playerRect)){
                //if more than one playerRect collect the item in the same frame
                //it will just be distributed to player 1
                expired = true;
                collectHandler();
            }
        }
    }

    const update = () => {
        //update the expired flag
        if(Date.now() - birthtime > duration){
            expired = true;
        }
        //do reborn if expired
        if(expired && waitingForReborn){
            waitingForReborn = false;
            setTimeout(() => {
                reborn();
            }, rebornInterval);
        }
    }

    const reborn = ()=>{
        //select new position
        x = Math.floor(Math.random()*1200); //canvas width
        y = Math.floor(Math.random()*800);  //canvas height
        edge.setXY(x,y);
        //reset the flag
        expired = false;
        waitingForReborn = true;
        //reset the birthtime
        birthtime = Date.now();
    }

    const getState = ()=>{
        return {
            render: !expired,
            x,
            y,
            w,
            h
        }
    }

    return {getEdge,getType,getState,update,checkCollected}
};