const mainGame = function() {
    let i = 0.01;

    let canvas_height = 500;
    let canvas_width = 500;

    let gameIsGoing = false; 
    
    let player_x = 0;
    let player_y = 0;
    
    let v_x = 0;
    let v_y = 0;
    
    let v_max = 5;
    
    let accel = 0.3;
    let decel = 0.3;
    
    let dir = "";

    let positions = [
        {
            username: "Kelvin",
            role: "Attacker",
            position: {
                x: 50,
                y: 50,
            },
            size: {
                x: 50,
                y: 50
            }
        },
        {
            username: "Fox",
            role: "Dodger",
            position: {
                x: 300,
                y: 300,
            },
            size: {
                x: 50,
                y: 50
            }
        },
    ]
    
    const key_mapping = {
        w: 1,
        s: 2,
        a: 4,
        d: 8,
        i: 1,
        k: 2,
        j: 3,
        l: 8,
    }
    
    const key_state = {
        w: false,
        s: false,
        a: false,
        d: false,
        i: false,
        k: false,
        j: false,
        l: false,
    }
    
    let moveState = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d" || e.key === "i" || e.key === "k" || e.key === "j" || e.key === "l") {
            if (!key_state[e.key]) {
                moveState += key_mapping[e.key];
                Socket.postInput(moveState);
                key_state[e.key] = true; 
            }
            //Deprecated
            dir = e.key;
        }
    });
    
    document.addEventListener("keyup", (e) => {
        if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d" || e.key === "i" || e.key === "k" || e.key === "j" || e.key === "l") {
            //console.log("cleared");
            dir = "";
            key_state[e.key] = false;
            moveState -= key_mapping[e.key];
            Socket.postInput(moveState);
        }
    })

    document.querySelector("#stopGameTest").addEventListener("click", ()=> {
        stopGame(); 
    })
    
    const ctx = document.getElementById('canvas').getContext('2d');
    
    console.log(ctx);

    /**
     * This function is called when the on the socket connection of "startgame"
     */
    function startGame(){
        //Remove Loading Screen
        loading.hide(); 
        show();

        gameIsGoing = true; 

        //Calls first frame
        draw(); 
    }

    function update(pos){
        positions = pos; 
    }

    function stopGame(){
        gameIsGoing = false; 
        hide();
        ranking.showRanking();
    }

    function show(){
        document.querySelector(".mainGame").style.display = "block";

        let windowWidth = document.documentElement.clientWidth;
        let windowHeight = document.documentElement.clientHeight; 

        document.querySelector("canvas").width = windowWidth - 40;
        document.querySelector("canvas").height = windowHeight - 40;
    }

    function hide(){
        document.querySelector(".mainGame").style.display = "none";
    }
    
    function drawRect(x_pos, y_pos, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x_pos, y_pos, width, height);
    }

    function updatePos(p) {
        positions = p; 
    }
    
    function draw() {
    
        // Original Code to move the player in the frontend
        // if (dir === "w") {
        //     //Up
        //     v_y -= accel;
        //     v_y = Math.max(v_y, -v_max)
        // } else if (dir === "s") {
        //     //Down
        //     v_y += accel;
        //     v_y = Math.min(v_y, v_max)
        // } else if (dir === "a") {
        //     //Left
        //     v_x -= accel;
        //     v_x = Math.max(v_x, -v_max)
        // } else if (dir === "d") {
        //     //Right
        //     v_x += accel;
        //     v_x = Math.min(v_x, v_max)
        // } else if (dir === "") {
        //     if (v_y > 0) {
        //         v_y -= decel;
        //         v_y = Math.max(v_y, 0);
        //     } else {
        //         v_y += decel;
        //         v_y = Math.min(v_y, 0);
        //     }
        //     if (v_x > 0) {
        //         v_x -= decel;
        //         v_x = Math.max(v_x, 0);
        //     } else {
        //         v_x += decel;
        //         v_x = Math.min(v_x, 0);
        //     }
        // }
        //player_x += v_x;
        //player_y += v_y;

        console.log("Frame");
    
        ctx.clearRect(0, 0, canvas_height, canvas_width)
    
        //drawRect(player_x, player_y, 50, 50, "rgb(200, 0, 0)")
    
        for (let p of positions){
            //console.log(p);
            if(p && p.username && p.position && p.size && p.role){

                let color = "rgb(200, 0, 0)";

                if(p.role == "Attacker"){
                    color = "rgb(200, 0, 0)";
                } else if (p.role == "Dodger"){
                    color = "rgb(0, 200, 0)";
                }

                drawRect(p.position.x, p.position.y, p.size.x, p.size.y, color)
            } else {
                //console.log("Player Position contains bad data!")
            }
        }
        
        if(gameIsGoing){
            window.requestAnimationFrame(draw);
        }
    }

    return {draw, startGame, stopGame, update}
}();