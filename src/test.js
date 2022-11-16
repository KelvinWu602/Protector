const player = (state)=>{
    const getS = ()=>{
        return state.speed;
    }

    return {getS}
}

const gamestate = {
    speed: 4
}


let a = player(gamestate);
let b = player(gamestate);


console.log(a.getS());
console.log(b.getS());

gamestate.speed = 5;


console.log(a.getS());
console.log(b.getS());
