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


document.addEventListener('keydown', (e) => {
    if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d") {
        dir = e.key;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d") {
        console.log("cleared");
        dir = "";
    }
})

const ctx = document.getElementById('canvas').getContext('2d');

    console.log(ctx);

function draw() {
    const ctx = document.getElementById('canvas').getContext('2d');

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

    ctx.fillStyle = "rgb(200, 0, 0)";
    ctx.fillRect(player_x, player_y, 50, 50);

    player_x += v_x;
    player_y += v_y;

    window.requestAnimationFrame(draw);
}

draw(); 