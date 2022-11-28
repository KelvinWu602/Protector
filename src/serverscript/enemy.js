const {Box} = require('./box.js');

module.exports.Enemy = function(ID,x,y, gamevariable) {
    const edge = Box(x,y,25,25);
    //set to false when enemy is killed
    let alive = true;

    let vx = 0;
    let vy = 0;
    //repulsion force x and y components
    let rfx = 0;
    let rfy = 0;

    const getID = ()=>{
        return ID;
    }

    const updateXY = (attacker, dodger)=>{
        const FACTOR = 1;
        const speed = gamevariable.speed * FACTOR;
        let {x,y} = edge.getXY();

        
        //calculating forces and return updated x y.
        const r_a = attacker.getPlayer().getDistance(edge);
        const r_d = dodger.getPlayer().getDistance(edge);

        const playerDimension = dodger.getPlayer().getEdge().getWH();
        const dodgerPosition = dodger.getPlayer().getEdge().getXY();
        const attackerPosition = attacker.getPlayer().getEdge().getXY();


        //Attraction force, point towards dodger's center
        vx = speed * (dodgerPosition.x + playerDimension.w/2 - x - edge.getWH().w/2) / r_d;
        vy = speed * (dodgerPosition.y + playerDimension.h/2 - y - edge.getWH().h/2) / r_d;

        //Repulsion force, point away from attacker's center
        rfx = speed * 50 * (x + edge.getWH().w/2 - attackerPosition.x - playerDimension.w/2) / r_a / r_a;
        rfy = speed * 50 * (y + edge.getWH().h/2 - attackerPosition.y - playerDimension.h/2) / r_a / r_a;

        // console.log("enemy: "+ r_a + " " + r_d + " " + vx + " " + vy + " " + rfx + " " + rfy);

        //update vx,vy
        vx += rfx;
        vy += rfy;

        //update x,y
        x += vx;
        y += vy;
        edge.setXY(x,y);
    }

    const update = (attacker, dodger)=>{
        if(alive){
            updateXY(attacker, dodger);
            if(attacker.getPlayer().getEdge().collideWith(edge)){
                alive = false;
            }
            if(dodger.getPlayer().getEdge().collideWith(edge)){
                dodger.damaged();
                return true;
            }
        }
        return false;
    }

    const getSpeed = () => {
        return gamevariable.speed;
    }

    const reborn = (x,y) => {
        alive = true;
        edge.setXY(x,y);
    }

    const isAlive = ()=>{
        return alive;
    }

    const getEdge = ()=>{
        return edge;
    }

    return {getEdge,getID,update,getSpeed,reborn,isAlive};
};
