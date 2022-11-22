const {Box} = require("./box.js");

const MOVESTATE = {
    STILL : 0,
    UP : 1,
    DOWN : 2,
    LEFT : 4,
    RIGHT : 8,
}

const Player = function(initx, inity, gamevariable){
    const edge = Box(initx,inity,50,50);
    let movestate = MOVESTATE.STILL;
    
    const getEdge = ()=>{ return edge; }

    const setMoveState = (current)=>{
        movestate = current;
    }

    const updateXY = ()=>{
        //update x,y based on movestate
        if(movestate == 0) return;

        let vx = 0;
        let vy = 0;
        
        if(movestate & MOVESTATE.UP) {
            vy -= gamevariable.speed + 2;
        }
        if(movestate & MOVESTATE.DOWN) {
            vy += gamevariable.speed + 2;
        }
        if(movestate & MOVESTATE.LEFT) {
            vx -= gamevariable.speed + 2;
        }
        if(movestate & MOVESTATE.RIGHT) {
            vx += gamevariable.speed + 2;
        }

        if(vx*vy!=0){
            //diagonal cases
            vx /= Math.sqrt(2);
            vy /= Math.sqrt(2);
        }

        //update x,y
        const {x,y} = edge.getXY();
        edge.setXY(x+vx,y+vy);
    }

    const update = (movestate)=>{
        setMoveState(movestate);
        updateXY();
    }

    const getDistance = (box)=>{
        const {x,y} = edge.getXY(); 
        const other = box.getXY();
        return Math.sqrt((x-other.x)**2 + (y-other.y)**2);
    }

    const getMovestate = ()=>{
        return movestate;
    }

    return {getEdge,setMoveState,updateXY,getDistance,update,getMovestate};
}

const Attacker = function(initx, inity, gamevariable) {
    const player = Player(initx,inity,gamevariable); 
    const getType = ()=>{ return type; }
    const getPlayer = ()=>{ return player; }
    return {getPlayer,getType};
}

const Dodger = function(initx, inity, gamevariable) {
    const player = Player(initx,inity,gamevariable); 
    let life = 1;
    let shielded = false;
    const getType = ()=>{ return type; }
    const getPlayer = ()=>{ return player; }
    const getLife = ()=>{ return life; }
    const getShielded = ()=>{ return shielded; }
    //Items handler
    const addLife = ()=>{ life++; }
    const addShield = ()=>{ shielded = true; }
    //Damage handler
    const damaged = ()=>{ if(!shielded){life--;} else {shielded=false;} }
    const isAlive = ()=>life>0;
    return {getPlayer,getType,getLife,getShielded,addLife,addShield,damaged,isAlive};
}

module.exports = {MOVESTATE, Attacker, Dodger};