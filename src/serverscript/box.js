module.exports.Box = function(x,y,w,h) {
    const getXY = ()=>{
        return {x,y};
    }

    const getWH = ()=>{
        return {w,h};
    }

    const setXY = (newx,newy)=>{
        x = newx;
        y = newy;
    }

    const collideWith = (otherbox)=>{
        const B = {...otherbox.getXY(),...otherbox.getWH()};
        for(let i=0;i<2;i++) {
            for(let j=0; j<2; j++) {
                if(pointInBox(B.x+i*B.w,B.y+j*B.h)){
                    return true;
                }
            }
        }
        return false;
    }

    const pointInBox = (px,py)=>{
        if(px >= x && px <= x+w && py >= y && py <= y+h){
            return true;
        }
        return false;
    }

    return {getXY,getWH,setXY,collideWith};
}