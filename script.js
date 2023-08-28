const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let frame = 0;
const minRadius = 50;
const maxRadius = 100;

function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function positiveNegative() {
    return Math.random() < 0.5 ? 1 : -1;
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
    return rotatedVelocities;
}

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

const mouse = {
    x: undefined,
    y: undefined,
};

const gravity = 0;
const terminalVelocity = 30;
const friction = 0.001;

const colorArray = [
    "#00121950",
    "#005f7350",
    "#0a939650",
    "#94d2bd50",
    "#e9d8a650",
    "#ee9b0050",
    "#ca670250",
    "#bb3e0350",
    "#ae201250",
    "#9b222650"
];

window.addEventListener("resize", () => {
    if (innerHeight !== canvas.height || innerWidth !== canvas.width) {
        location.reload();
    }
});
window.addEventListener("mousemove", (event) => {
    [mouse.x, mouse.y] = [event.x, event.y];
});
window.addEventListener("click", () => {

    circles.forEach((circle) => {
        if (circle.x < mouse.x + circle.radius && circle.x > mouse.x - circle.radius && circle.y > mouse.y - circle.radius && circle.y < mouse.y + circle.radius && !circle.bounded) {
            circle.bounded = true;
            circle.velocity.x = 0;
            circle.velocity.y = 0;
            canvas.classList.add("mouseBound");
        } else if (circle.x < mouse.x + circle.radius && circle.x > mouse.x - circle.radius && circle.y > mouse.y - circle.radius && circle.y < mouse.y + circle.radius && circle.bounded) {
            canvas.classList.remove("mouseBound");
            circle.bounded = false;
        }
    });
});
function Circle(x, y, dx, dy, radius) {
    this.img = document.getElementById("snowball");
    this.x = x;
    this.y = y;
    this.velocity = {
        x: dx,
        y: dy
    };
    this.radius = radius;
    this.minRadius = radius;
    this.mass = 1;
    let color = colorArray[randomInRange(0, colorArray.length - 1)];

    this.frame = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 512;
    this.spriteHeight = 512;
    this.maxFrame = 0;
    this.minFrame = 0;
    this.angle = Math.atan2(this.velocity.y, this.velocity.x);

    const scaleFactor = this.radius * 2.8 / this.spriteHeight;
    const adjustedSpriteWidth = this.spriteWidth * scaleFactor;
    const adjustedSpriteHeight = this.spriteHeight * scaleFactor;
    const drawY = this.y - adjustedSpriteHeight / 2;

    this.bounded = false;


    this.draw = function (circles) {
        ctx.beginPath();
        ctx.fillStyle = color;
        // ctx.strokeStyle = color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        // ctx.stroke();
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

    this.update = function (circles) {
        if ((this.y >= innerHeight - this.radius && this.velocity.y > 0) || (this.y <= this.radius && this.velocity.y < 0)) {
            this.velocity.y = -this.velocity.y * (1 - friction);
        }
        if ((this.x >= innerWidth - this.radius && this.velocity.x > 0) || (this.x <= this.radius && this.velocity.x < 0)) {
            this.velocity.x = -this.velocity.x * (1 - friction);
        }
        // if (this.x > innerWidth - this.radius) {
        //     this.x = innerWidth - this.radius + 1;
        // }
        // if (this.y > innerHeight - this.radius) {
        //     this.y = innerHeight - this.radius + 1;
        // }
        // if (this.x < this.radius) {
        //     this.x = this.radius + 1;
        // }
        // if (this.y < this.radius) {
        //     this.y = this.radius + 1;
        // }
        // if (this.y > innerHeight) {
        //     this.velocity.y = randomInRange(0, 9);
        //     this.y = this.radius + 1;
        // }
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
        // Interactivity

        // if (mouse.x - this.x < maxRadius && mouse.x - this.x > -maxRadius
        //     && mouse.y - this.y < maxRadius && mouse.y - this.y > -maxRadius && this.radius < maxRadius
        // ) {
        //     this.radius += 4;
        // } else if (this.radius > this.minRadius && !(mouse.x - this.x < maxRadius && mouse.x - this.x > -maxRadius
        //     && mouse.y - this.y < maxRadius && mouse.y - this.y > -maxRadius)) {
        //     this.radius -= 1;
        // }

        // animation
        if (frame % 5 === 0) {
            this.frame = this.frame < this.maxFrame ? this.frame + 1 : this.minFrame;
            this.frameX = this.frame % 3;
            this.frameY = Math.floor(this.frame / 3);
        }
        this.angle = Math.atan2(this.velocity.y, this.velocity.x);

        this.draw();
    };
}

const circles = [];
let init = () => {

    for (let i = 0; i < (Math.floor(canvas.width / (maxRadius * 2)) * Math.floor(canvas.height / (maxRadius * 2))); i++) {
        let radius = randomInRange(minRadius, maxRadius);
        let x = randomInRange(radius, innerWidth - radius);
        let y = randomInRange(radius, innerHeight - radius);
        if (i > 0) {
            for (let j = 0; j < circles.length; j++) {
                if (distance(x, y, circles[j].x, circles[j].y) < radius + circles[j].radius) {
                    x = randomInRange(radius, innerWidth - radius);
                    y = randomInRange(radius, innerHeight - radius);
                    j = -1;
                }
            }
        }

        circles.push(new Circle(x, y, positiveNegative() * 2, positiveNegative() * 2, radius));
    }
};
init();
let animate = function () {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    circles.forEach(circle => (circle.update(circles)));
    frame++;
};
animate();