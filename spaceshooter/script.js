// ================== GAME STATE ==================
let gameActive = false;
let score = 0;
let setint; // Enemy spawn interval

// Game board
let body = document.body;
let board = document.querySelector(".board");
let m = 0; // Background scroll offset

// Player settings
let velo = 5; // Ship speed
let p1 = {
    x: 0,
    y: 0,
    joind: false,
    up: false, down: false,
    left: false, right: false,
};

// Player bullets
let p1ShipBullets = [];
let p1ShipB = [];

// Player ship
let ships = [];

// Enemies
let arrEnemyOne = [], arrEnemyOneP = [], enmy1H = [];
let arrEnemyTwo = [], arrEnemyTwoP = [], enmy2H = [];
let arrEnemyFour = [], arrEnemyFourP = [], enmy4H = [];
let bossOne = [], bossOnep = [], bossOneH = [];

let enemykilld = 0; // Enemy kill counter

// ================== UI ELEMENTS ==================
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');

// Touch control elements
const joystick = document.getElementById('joystick');
const joystickHandle = document.getElementById('joystick-handle');
const shootButton = document.getElementById('shoot-button');

// ================== TOUCH CONTROLS ==================
let joystickActive = false;
let joystickCenterX = 0;
let joystickCenterY = 0;

// Initialize joystick position
function initJoystick() {
    const rect = joystick.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;
}

// Touch start for joystick
joystick.addEventListener('touchstart', function (e) {
    if (!gameActive) return;
    e.preventDefault();
    joystickActive = true;
    initJoystick();

    // Reset movement
    p1.up = p1.down = p1.left = p1.right = false;
});

// Touch move for joystick
document.addEventListener('touchmove', function (e) {
    if (!joystickActive || !gameActive) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - joystickCenterX;
    const deltaY = touch.clientY - joystickCenterY;

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = joystick.offsetWidth / 2 - joystickHandle.offsetWidth / 2;

    // Normalize and limit the joystick handle position
    const angle = Math.atan2(deltaY, deltaX);
    const limitedDistance = Math.min(distance, maxDistance);

    // Update joystick handle position
    const handleX = Math.cos(angle) * limitedDistance;
    const handleY = Math.sin(angle) * limitedDistance;

    joystickHandle.style.transform = `translate(${handleX}px, ${handleY}px)`;

    // Set movement based on direction
    const threshold = 20;

    // Reset all directions
    p1.up = p1.down = p1.left = p1.right = false;

    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < -threshold) p1.left = true;
            if (deltaX > threshold) p1.right = true;

            if (deltaY < -threshold / 2) p1.up = true;
            if (deltaY > threshold / 2) p1.down = true;
        } else {
            if (deltaY < -threshold) p1.up = true;
            if (deltaY > threshold) p1.down = true;

            if (deltaX < -threshold / 2) p1.left = true;
            if (deltaX > threshold / 2) p1.right = true;
        }
    }
}, { passive: false });

// Touch end for joystick
document.addEventListener('touchend', function (e) {
    if (!joystickActive) return;

    // Reset joystick
    joystickActive = false;
    joystickHandle.style.transform = 'translate(0, 0)';

    // Stop movement
    p1.up = p1.down = p1.left = p1.right = false;
});

// Shoot button touch
shootButton.addEventListener('touchstart', function (e) {
    if (!gameActive) return;
    e.preventDefault();

    // Fire a bullet
    attk(p1.y, p1.x);

    // Add visual feedback
    shootButton.style.backgroundColor = 'rgba(255, 0, 234, 0.3)';
    setTimeout(() => {
        shootButton.style.backgroundColor = 'rgba(255, 0, 234, 0.1)';
    }, 150);
});

// Touch shooting on the right side of the screen
board.addEventListener('touchstart', function (e) {
    if (!gameActive) return;

    // Check if touch is on the right side of the screen (for shooting)
    const touch = e.touches[0];
    if (touch.clientX > window.innerWidth / 2) {
        e.preventDefault();
        attk(p1.y, p1.x);
    }
});

// ================== GAME INITIALIZATION ==================
function initGame() {
    // Reset game state
    gameActive = true;
    score = 0;
    enemykilld = 0;
    updateScore();

    // Clear any existing game elements
    clearGameElements();

    // Set player starting position (bottom center)
    p1.x = board.clientWidth / 2;
    p1.y = board.clientHeight - 100;

    // Create player ship
    createP1(p1.x, p1.y);
    p1.joind = true;

    // Start enemy spawn loop
    startEnemySpawning();

    // Hide start screen, show game
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    // Initialize joystick
    initJoystick();

    // Start game loop
    requestAnimationFrame(gameloop);
}

function clearGameElements() {
    // Remove all bullets
    p1ShipBullets.forEach(bullet => bullet.remove());
    p1ShipBullets = [];
    p1ShipB = [];

    // Remove all enemies
    [arrEnemyOne, arrEnemyTwo, arrEnemyFour, bossOne].forEach(enemyArray => {
        enemyArray.forEach(enemy => enemy.remove());
    });
    arrEnemyOne = []; arrEnemyOneP = []; enmy1H = [];
    arrEnemyTwo = []; arrEnemyTwoP = []; enmy2H = [];
    arrEnemyFour = []; arrEnemyFourP = []; enmy4H = [];
    bossOne = []; bossOnep = []; bossOneH = [];

    // Remove player ship
    ships.forEach(ship => ship.remove());
    ships = [];
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function gameOver() {
    gameActive = false;
    if (setint) clearInterval(setint);
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';

    // Reset player controls
    p1.up = p1.down = p1.left = p1.right = false;
}

// ================== ENEMY SPAWN LOOP ==================
function startEnemySpawning() {
    setint = setInterval(() => {
        if (!gameActive) return;

        let randomEenemy = Math.ceil(Math.random() * 4);

        // Enemy sprites
        let enemy1 = "image/enmy-1.png";
        let enemy2 = "image/enmy-2.png";
        let enemy4 = "image/enmy-4.png";
        let boss1 = "image/red-boss.png";

        // Spawn boss after kills
        if (enemykilld >= 100) {
            createEnmy(400, boss1, bossOne, bossOnep, bossOneH, 100, true, 500);
            clearInterval(setint);
        }

        // Random spawn logic
        if (randomEenemy === 1) {
            if (arrEnemyOne.length >= 2) {
                createEnmy(90, enemy2, arrEnemyTwo, arrEnemyTwoP, enmy2H, 90);
            } else {
                createEnmy(100, enemy1, arrEnemyOne, arrEnemyOneP, enmy1H, 100);
            }
        }
        if (randomEenemy === 2) {
            createEnmy(90, enemy2, arrEnemyTwo, arrEnemyTwoP, enmy2H, 90);
        }
        if (randomEenemy === 3 || randomEenemy === 4) {
            createEnmy(60, enemy4, arrEnemyFour, arrEnemyFourP, enmy4H, 60);
        }
    }, 1500);
}

// ================== GAME LOOP ==================
function gameloop() {
    if (!gameActive) return;

    // Background scroll
    m += 0.4;
    board.style.backgroundPosition = `50% ${m}px`;

    // Update player ship
    if (p1.joind && ships.length > 0) {
        let ship = ships[0];
        let h = ship.clientHeight;
        let w = ship.clientWidth;

        // Keep ship within bounds
        p1.x = Math.max(w / 2, Math.min(p1.x, board.clientWidth - w / 2));
        p1.y = Math.max(h / 2, Math.min(p1.y, board.clientHeight - h / 2));

        ship.style.left = `${p1.x - w / 2}px`;
        ship.style.top = `${p1.y - h / 2}px`;
    }

    // Player movement
    if (p1.joind) {
        if (p1.up) p1.y -= velo;
        if (p1.down) p1.y += velo;
        if (p1.left) p1.x -= velo;
        if (p1.right) p1.x += velo;
    }

    // Player bullet updates
    for (let i = p1ShipBullets.length - 1; i >= 0; i--) {
        p1ShipB[i].y -= 15;
        p1ShipBullets[i].style.top = p1ShipB[i].y + "px";

        // Remove bullet if offscreen
        if (p1ShipB[i].y <= 0) {
            p1ShipBullets[i].remove();
            p1ShipBullets.splice(i, 1);
            p1ShipB.splice(i, 1);
        }
    }

    // Bullet vs Enemy collision
    Colide(p1ShipB, arrEnemyOne, arrEnemyOneP, enmy1H);
    Colide(p1ShipB, arrEnemyTwo, arrEnemyTwoP, enmy2H);
    Colide(p1ShipB, arrEnemyFour, arrEnemyFourP, enmy4H);
    Colide(p1ShipB, bossOne, bossOnep, bossOneH);

    // Player vs Enemy collision - FIXED: Check if ships[0] exists
    if (ships.length > 0 && ships[0]) {
        shipColide(arrEnemyOne, arrEnemyOneP, enmy1H);
        shipColide(arrEnemyTwo, arrEnemyTwoP, enmy2H);
        shipColide(arrEnemyFour, arrEnemyFourP, enmy4H);
    }

    // Enemy movement/logic
    if (arrEnemyOne.length) enemyFunc(0.7, arrEnemyOne, arrEnemyOneP, false, enmy1H, false);
    if (arrEnemyTwo.length) enemyFunc(5, arrEnemyTwo, arrEnemyTwoP, false, enmy2H, false);
    if (arrEnemyFour.length) enemyFunc(10, arrEnemyFour, arrEnemyFourP, true, enmy4H, false);
    if (bossOne.length) enemyFunc(0.7, bossOne, bossOnep, false, bossOneH, true);

    requestAnimationFrame(gameloop);
}

// ================== EVENT HANDLERS ==================

// Key down
document.addEventListener("keydown", event => {
    if (!gameActive) return;

    if (event.key.startsWith("Arrow")) {
        if (event.key === "ArrowUp") p1.up = true;
        if (event.key === "ArrowDown") p1.down = true;
        if (event.key === "ArrowLeft") p1.left = true;
        if (event.key === "ArrowRight") p1.right = true;
    }
});

// Key up
document.addEventListener("keyup", event => {
    if (!gameActive) return;

    if (event.key === "Enter") attk(p1.y, p1.x);
    if (event.key.startsWith("Arrow")) {
        if (event.key === "ArrowUp") p1.up = false;
        if (event.key === "ArrowDown") p1.down = false;
        if (event.key === "ArrowLeft") p1.left = false;
        if (event.key === "ArrowRight") p1.right = false;
    }
});

// Start and restart buttons
startButton.addEventListener("click", initGame);
restartButton.addEventListener("click", initGame);

// ================== FUNCTIONS ==================

/**
 * Create player ship
 */
function createP1(x, y) {
    let ship = document.createElement("div");
    board.appendChild(ship);
    ship.classList.add("ship");

    // Wait for the ship to be rendered to get its dimensions
    setTimeout(() => {
        let h = ship.clientHeight;
        let w = ship.clientWidth;

        ship.style.left = `${x - w / 2}px`;
        ship.style.top = `${y - h / 2}px`;

        ships.push(ship);
    }, 0);
}

/**
 * Fire bullet from player
 */
function attk(a, b) {
    let bullet = document.createElement("div");
    board.appendChild(bullet);
    bullet.classList.add("bullet");

    bullet.style.top = a - 5 / 2 + "px";
    bullet.style.left = b - 5 / 2 + "px";

    p1ShipBullets.push(bullet);
    p1ShipB.push({ x: b, y: a });
}

/**
 * Collision: bullets vs enemies
 */
function Colide(array, enemyArr, enemyPos, enemyHealth) {
    for (let i = array.length - 1; i >= 0; i--) {
        for (let j = 0; j < enemyPos.length; j++) {
            // Get actual enemy dimensions
            const enemyRect = enemyArr[j].getBoundingClientRect();
            const enemyWidth = enemyRect.width;
            const enemyHeight = enemyRect.height;

            // Get bullet dimensions
            const bulletRect = p1ShipBullets[i].getBoundingClientRect();
            const bulletWidth = bulletRect.width;
            const bulletHeight = bulletRect.height;

            if (
                array[i].y <= enemyPos[j].y + enemyHeight &&
                array[i].x >= enemyPos[j].x &&
                array[i].x <= enemyPos[j].x + enemyWidth &&
                array[i].y >= enemyPos[j].y
            ) {
                // Remove bullet
                p1ShipBullets[i].remove();
                p1ShipBullets.splice(i, 1);
                p1ShipB.splice(i, 1);

                // Damage enemy
                enemyHealth[j] -= 10;

                // Enemy destroyed
                if (enemyHealth[j] <= 0) {
                    createExplo(enemyArr, j, enemyWidth);
                    enemyArr[j].remove();
                    enemyArr.splice(j, 1);
                    enemyPos.splice(j, 1);
                    enemyHealth.splice(j, 1);
                    enemykilld++;
                    score += 100;
                    updateScore();
                }
                break;
            }
        }
    }
}

/**
 * Explosion effect
 */
function createExplo(array, a, h) {
    let exp = document.createElement("div");
    board.appendChild(exp);
    exp.classList.add("exp");

    exp.style.width = h + "px";
    exp.style.height = h + "px";
    exp.style.top = array[a].style.top;
    exp.style.left = array[a].style.left;
    exp.style.backgroundImage = "url('image/Ws1o.gif')";

    new Audio('audio/explode-trimed.wav').play();

    setTimeout(() => exp.remove(), 800);
}

/**
 * Player vs Enemy collision - FIXED: Check if ships[0] exists
 */
function shipColide(enemyArr, enemyPos, enemyHealth) {
    // Check if player ship exists
    if (ships.length === 0 || !ships[0]) return;

    for (let j = 0; j < enemyPos.length; j++) {
        // Get actual enemy dimensions
        const enemyRect = enemyArr[j].getBoundingClientRect();
        const enemyWidth = enemyRect.width;
        const enemyHeight = enemyRect.height;

        // Get player dimensions
        const playerRect = ships[0].getBoundingClientRect();
        const playerWidth = playerRect.width;
        const playerHeight = playerRect.height;

        if (
            p1.y <= enemyPos[j].y + enemyHeight &&
            p1.x >= enemyPos[j].x &&
            p1.x <= enemyPos[j].x + enemyWidth &&
            p1.y >= enemyPos[j].y
        ) {
            createExplo(enemyArr, j, enemyWidth);

            enemyArr[j].remove();
            enemyArr.splice(j, 1);
            enemyPos.splice(j, 1);
            enemyHealth.splice(j, 1);

            if (ships.length > 0) {
                ships[0].remove();
                ships = [];
            }

            p1.x = 0; p1.y = 0;
            p1.joind = false;

            enemykilld++;
            score += 50;
            updateScore();
            new Audio('audio/explode-trimed.wav').play();

            // Game over
            gameOver();
            break;
        }
    }
}

/**
 * Create enemy
 */
function createEnmy(eh, im, array, arrayPos, enemyHealth, health, boss, ew) {
    // Calculate the board boundaries
    const boardRect = board.getBoundingClientRect();
    const boardLeft = 0;
    const boardRight = boardRect.width;

    // Adjust sizes for small screens
    let adjustedEh = eh;
    let adjustedEw = ew;

    // Get screen width for responsive sizing
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
        adjustedEh = eh * 0.7;
        if (adjustedEw) adjustedEw = ew * 0.7;
    }
    if (screenWidth <= 480) {
        adjustedEh = eh * 0.5;
        if (adjustedEw) adjustedEw = ew * 0.5;
    }

    // Calculate random position within the board
    let randomX = Math.floor(Math.random() * (boardRight - boardLeft - adjustedEh)) + boardLeft;

    let x = randomX;
    let y = -adjustedEh;

    // If it's a boss, center it
    if (boss) {
        x = boardRect.width / 2 - adjustedEw / 2;
    }

    let enmyOne = document.createElement("div");
    board.appendChild(enmyOne);
    enmyOne.classList.add("enemyOne");
    enmyOne.style.width = adjustedEh + "px";
    enmyOne.style.height = adjustedEh + "px";
    enmyOne.style.backgroundImage = `url('${im}')`;

    enmyOne.style.left = x + "px";
    enmyOne.style.top = y + "px";

    array.push(enmyOne);
    arrayPos.push({ x, y });
    enemyHealth.push(health);
}

/**
 * Enemy behavior / movement
 */
function enemyFunc(speed, array, arrayPos, special, enemyHealth, boss) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (special) specialenemy(array, arrayPos, i, speed);
        if (boss) rlmove(array, arrayPos, i, speed);
        if (!boss && !special) {
            arrayPos[i].y += speed;
            array[i].style.top = arrayPos[i].y + "px";
        }
        // Remove if offscreen
        if (arrayPos[i].y >= body.clientHeight) {
            array[i].remove();
            array.splice(i, 1);
            arrayPos.splice(i, 1);
            enemyHealth.splice(i, 1);
        }
    }
}

/**
 * Special enemy behavior
 */
function specialenemy(array, arrayPos, i, speed) {
    if (arrayPos[i].y >= body.clientHeight / 2 - 300) speed = 1;

    let a = p1.y - arrayPos[i].y;
    let b = p1.x - arrayPos[i].x;
    let deg = Math.atan(b / a) * (180 / Math.PI);

    if (p1.x >= 0 && p1.y >= 0) {
        array[i].style.transform = `rotate(${0}deg)`;
    }
    if (p1.y <= arrayPos[i].y) {
        array[i].style.transform = `rotate(${-deg + 180}deg)`;
        if (p1.x <= 0 && p1.y <= 0) {
            array[i].style.transform = `rotate(${0}deg)`;
        }
    } else {
        array[i].style.transform = `rotate(${-deg}deg)`;
        if (p1.x <= 0 && p1.y <= 0) {
            array[i].style.transform = `rotate(${0}deg)`;
        }
    }

    arrayPos[i].y += speed;
    array[i].style.top = arrayPos[i].y + "px";
}

/**
 * Boss left-right movement
 */
let bossDir = true;
function rlmove(array, arrayPos, i, speed) {
    const boardRect = board.getBoundingClientRect();
    const boardLeft = 0;
    const boardRight = boardRect.width;

    // Get actual boss dimensions
    const bossRect = array[i].getBoundingClientRect();
    const bossWidth = bossRect.width;

    if (arrayPos[i].y >= 0) {
        if (bossDir) {
            arrayPos[i].x += speed;
            array[i].style.left = arrayPos[i].x + "px";
        }
        if (arrayPos[i].x + bossWidth >= boardRight - 30) bossDir = false;
        if (arrayPos[i].x <= boardLeft + 30) bossDir = true;
        if (!bossDir) {
            arrayPos[i].x -= speed;
            array[i].style.left = arrayPos[i].x + "px";
        }
    } else {
        arrayPos[i].y += speed;
        array[i].style.top = arrayPos[i].y + "px";
    }
}

//Demo