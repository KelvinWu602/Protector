let i = 0.01;

let canvas_height = 500;
let canvas_width = 500;

let player_x = 0;
let player_y = 0;

let v_x = 0;
let v_y = 0;

let v_max = 5;

let accel = 0.3;
let decel = 0.3;

let dir = "";

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

const ctx = document.getElementById('canvas').getContext('2d');

console.log(ctx);

function drawRect(x_pos, y_pos, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x_pos, y_pos, width, height);
}

function draw() {

    if (dir === "w") {
        //Up
        v_y -= accel;
        v_y = Math.max(v_y, -v_max)
    } else if (dir === "s") {
        //Down
        v_y += accel;
        v_y = Math.min(v_y, v_max)
    } else if (dir === "a") {
        //Left
        v_x -= accel;
        v_x = Math.max(v_x, -v_max)
    } else if (dir === "d") {
        //Right
        v_x += accel;
        v_x = Math.min(v_x, v_max)
    } else if (dir === "") {
        if (v_y > 0) {
            v_y -= decel;
            v_y = Math.max(v_y, 0);
        } else {
            v_y += decel;
            v_y = Math.min(v_y, 0);
        }
        if (v_x > 0) {
            v_x -= decel;
            v_x = Math.max(v_x, 0);
        } else {
            v_x += decel;
            v_x = Math.min(v_x, 0);
        }
    }

    ctx.clearRect(0, 0, canvas_height, canvas_width)

    drawRect(player_x, player_y, 50, 50, "rgb(200, 0, 0)")

    player_x += v_x;
    player_y += v_y;

    window.requestAnimationFrame(draw);
}

draw(); 