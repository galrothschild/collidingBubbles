const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
// Define Canvas Size to fit screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = false;
let frame = 0;
let score = 0;
const minRadius = 50;
let doAnimation = true;
const gravity = 0;
const terminalVelocity = 30;
const friction = 0;
let scoreSizeMap = setBubbleSizeMap();
const maxRadius = Math.max(...scoreSizeMap.keys());
const colorArray = [
    "#f7258530",
    "#7209b730",
    "#3a0ca330",
    "#4361ee30",
    "#4cc9f030",
];
const mouse = {
    x: undefined,
    y: undefined,
};
const circles = [];
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
// Set the buuble size to score map responsively
function setBubbleSizeMap() {
    let scoreSizeMap;
    if (canvas.width > 660) {
        scoreSizeMap = new Map([[10, 50], [20, 25], [50, 10], [100, 3]]);
    } else {
        scoreSizeMap = new Map([[20, 50], [25, 25], [30, 10], [50, 3]]);
    }
    return scoreSizeMap;
}
// Calculate the distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
// return either 1 or -1 randomly
function positiveNegative() {
    return Math.random() < 0.5 ? 1 : -1;
}
// Rotate the POV for collision handling
function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
    return rotatedVelocities;
}
// Collision handling
function colide(circle, otherCircle) {
    const xVelocityDifference = circle.velocity.x - otherCircle.velocity.x;
    const yVelocityDifference = circle.velocity.y - otherCircle.velocity.y;

    const xDistance = otherCircle.x - circle.x;
    const yDistance = otherCircle.y - circle.y;

    if (xVelocityDifference * xDistance + yVelocityDifference * yDistance >= 0) {
        const angle = -Math.atan2(otherCircle.y - circle.y, otherCircle.x - circle.x);

        const m1 = circle.mass;
        const m2 = otherCircle.mass;

        const u1 = rotate(circle.velocity, angle);
        const u2 = rotate(otherCircle.velocity, angle);

        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        const finalVelocity1 = rotate(v1, -angle);
        const finalVelocity2 = rotate(v2, -angle);

        circle.velocity.x = finalVelocity1.x * (1 - friction);
        circle.velocity.y = finalVelocity1.y * (1 - friction);

        otherCircle.velocity.x = finalVelocity2.x * (1 - friction);
        otherCircle.velocity.y = finalVelocity2.y * (1 - friction);

    }

}

// Display the current score in the score div
function showScore(score) {
    document.getElementById("score").innerText = score;
}
// handle touch events so it won't highlight the whole screen
[canvas, document.getElementById("gameDiv")].forEach(element => element.addEventListener('touchstart', function (event) {
    event.preventDefault();
    [mouse.x, mouse.y] = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
    if (gameRunning) {
        circles.forEach((circle) => {
            if (circle.x < mouse.x + circle.radius && circle.x > mouse.x - circle.radius && circle.y > mouse.y - circle.radius && circle.y < mouse.y + circle.radius && !circle.bounded) {
                circle.pop();
            } else if (circle.x < mouse.x + circle.radius && circle.x > mouse.x - circle.radius && circle.y > mouse.y - circle.radius && circle.y < mouse.y + circle.radius && circle.bounded) {
                canvas.classList.remove("mouseBound");
                circle.bounded = false;
            }
        });
    }
}, false));
// resize event handler
window.addEventListener("resize", () => {
    if (innerHeight !== canvas.height || innerWidth !== canvas.width) {
        location.reload();
    }
});
// Mouse move event handler
window.addEventListener("mousemove", (event) => {
    [mouse.x, mouse.y] = [event.x, event.y];
});
// Click event handler
window.addEventListener("click", () => {
    if (gameRunning) {
        circles.forEach((circle) => {
            if (circle.x < mouse.x + circle.radius && circle.x > mouse.x - circle.radius && circle.y > mouse.y - circle.radius && circle.y < mouse.y + circle.radius && !circle.bounded) {
                circle.pop();
            } else if (circle.x < mouse.x + circle.radius && circle.x > mouse.x - circle.radius && circle.y > mouse.y - circle.radius && circle.y < mouse.y + circle.radius && circle.bounded) {
                canvas.classList.remove("mouseBound");
                circle.bounded = false;
            }
        });
    }
});
// Circle Constructor
function Circle(x, y, dx, dy, radius) {
    this.img = document.getElementById("bubble");
    this.x = x;
    this.y = y;
    this.velocity = {
        x: dx,
        y: dy
    };
    this.radius = radius;
    this.minRadius = radius;
    this.mass = 1;
    this.color = colorArray[randomInRange(0, colorArray.length - 1)];
    this.lastFrame = 0;
    this.frame = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 512;
    this.spriteHeight = 512;
    this.maxFrame = 0;
    this.minFrame = 0;
    this.angle = Math.atan2(this.velocity.y, this.velocity.x);
    this.popped = false;
    const scaleFactor = this.radius * 2.8 / this.spriteHeight;
    const adjustedSpriteWidth = this.spriteWidth * scaleFactor;
    const adjustedSpriteHeight = this.spriteHeight * scaleFactor;

    this.bounded = false;

    // Pop handling
    this.pop = function () {
        if (!this.popped) {
            this.popped = true;
            this.velocity = { x: 0, y: 0 };
            this.maxFrame = 5;
            this.lastFrame = frame + this.maxFrame * 3 + 1;
            this.color = "#00000000";
            score += scoreSizeMap.get(this.radius);
            showScore(score);
        }
    };
    // Drawing the bubble
    this.draw = function () {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.save();
        ctx.translate(this.x + this.radius * 0.6, this.y - this.radius * 1.4);
        ctx.drawImage(
            this.img,
            this.frameX * this.spriteWidth,
            this.frameY * this.spriteHeight,
            this.spriteWidth,
            this.spriteHeight,
            -this.radius * 2,
            0,
            adjustedSpriteWidth,
            adjustedSpriteHeight
        );
        ctx.restore();

    };
    // Handling the animation
    this.update = function () {
        if (frame >= this.lastFrame && this.lastFrame) {
            let index = circles.indexOf(this);
            circles.splice(index, 1);
            createBubble(circles);
        }
        if ((this.y >= innerHeight - this.radius && this.velocity.y > 0) || (this.y <= this.radius && this.velocity.y < 0)) {
            this.velocity.y = -this.velocity.y * (1 - friction);
        }
        if ((this.x >= innerWidth - this.radius && this.velocity.x > 0) || (this.x <= this.radius && this.velocity.x < 0)) {
            this.velocity.x = -this.velocity.x * (1 - friction);
        }
        if (this.velocity.y < terminalVelocity && this.y < innerHeight - this.radius) { this.velocity.y += gravity; }
        if (this.velocity.y > terminalVelocity) { this.velocity.y = terminalVelocity; }
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        //binding
        if (this.bounded) {
            this.pervious = {
                x: this.x,
                y: this.y
            };
            this.x = mouse.x;
            this.y = mouse.y;
            this.velocity = {
                x: this.x - this.pervious.x,
                y: this.y - this.pervious.y
            };
        }

        // collision

        for (let i = 0; i < circles.length; i++) {
            if (circles[i] === this) continue;
            if (distance(this.x, this.y, circles[i].x, circles[i].y) < this.radius + circles[i].radius) {
                colide(this, circles[i]);
            }
        }
        // animation
        if (frame % this.maxFrame === 0) {
            this.frame = this.frame < this.maxFrame ? this.frame + 1 : this.minFrame;
            this.frameX = this.frame % 3;
            this.frameY = Math.floor(this.frame / 3);
        }
        this.angle = Math.atan2(this.velocity.y, this.velocity.x);

        this.draw();
    };
}
// Create a bubble
function createBubble() {
    let radius = [...scoreSizeMap.keys()][randomInRange(0, 3)];
    let x = randomInRange(radius, innerWidth - radius);
    let y = randomInRange(radius, innerHeight - radius);
    if (circles.length > 0) {
        for (let j = 0; j < circles.length; j++) {
            if (distance(x, y, circles[j].x, circles[j].y) < radius + circles[j].radius) {
                x = randomInRange(radius, innerWidth - radius);
                y = randomInRange(radius, innerHeight - radius);
                j--;
            }
        }
    }

    circles.push(new Circle(x, y, positiveNegative() * 2, positiveNegative() * 2, radius));
}
// Game timer
function startTimer() {

    const timer = document.getElementById("timer");
    let gameTime = 20;
    timer.innerText = `${(Math.floor(gameTime / 60)).toString().padStart(2, "0")}:${(gameTime % 60).toString().padStart(2, "0")}`;
    let id = setInterval(() => {
        if (gameTime === 0) {
            endGame();
            clearInterval(id);
        } else {
            timer.innerText = `${(Math.floor(gameTime / 60)).toString().padStart(2, "0")}:${(gameTime % 60).toString().padStart(2, "0")}`;
            gameTime--;
        }
    }, 1000);

}
// Save score to local storage
function saveScore(score) {
    if (localStorage.getItem("highScore") === null) {
        localStorage.setItem("highScore", score);
    } else {
        localStorage.setItem("highScore", +localStorage.getItem("highScore") > score ? +localStorage.getItem("highScore") : score);
    }
    showHighScore();
}
// Show high score
function showHighScore() {
    document.getElementById("highScore").innerText = localStorage.getItem("highScore") ?? "Don't have one yet";
}
// Finish the game when timer is over
function endGame() {
    gameRunning = false;
    saveScore(score);
    document.getElementById("gameDiv").style.display = "";
    document.getElementById("gameControls").style.display = "";
}
// Initiate the screen with bubbles
let init = () => {
    circles.length = 0;
    for (let i = 0; i < (Math.floor(canvas.width / (maxRadius * 2)) * Math.floor(canvas.height / (maxRadius * 2))); i++) {
        createBubble();
    }
    showHighScore();
};
// Start the game
function startGame() {
    score = 0;
    showScore(score);
    document.getElementById("gameDiv").style.display = "block";
    document.getElementById("gameControls").style.display = "none";
    init();
    startTimer();
    gameRunning = true;
}
// Animate the canvas
let animate = function () {
    requestAnimationFrame(animate);
    if (doAnimation) {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        circles.forEach(circle => (circle.update()));
        frame++;
    }

};
init();
animate();