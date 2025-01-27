// Initial game state
const gameState = {
    player: {
        health: 100,
        points: 50,
        pos_x: 200,
        pos_y: 100,
        direction: [0, 0] // x,y
    },
    level: 1,
    enemies: [
        { type: "wolf", pos_x: 300, pos_y: 200, direction: [-1, -1] },
        { type: "wolf", pos_x: 500, pos_y: 560, direction: [1, 1] }
    ]
};

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem("gameState", JSON.stringify(gameState));
    console.log("Game state saved to browser!");
}

// Load game state from localStorage
function loadGameState() {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
        const loadedState = JSON.parse(savedState);
        console.log("Loaded game state:", loadedState);
        return loadedState;
    } else {
        console.log("No saved game state found.");
        return null;
    }
}

// inputs for movement
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") gameState.player.direction = [0, -1];
    if (event.key === "ArrowDown") gameState.player.direction = [0, 1];
    if (event.key === "ArrowLeft") gameState.player.direction = [-1, 0];
    if (event.key === "ArrowRight") gameState.player.direction = [1, 0];
});

// stop moving when no key pressed
document.addEventListener("keyup", () => {
    gameState.player.direction = [0, 0];
});

// Update game state
function updateGameState() {
    // Update player position
    gameState.player.pos_x += gameState.player.direction[0] * 5;
    gameState.player.pos_y += gameState.player.direction[1] * 5;

    // Ensure the player stays within bounds
    gameState.player.pos_x = Math.max(0, Math.min(canvas.width, gameState.player.pos_x));
    gameState.player.pos_y = Math.max(0, Math.min(canvas.height, gameState.player.pos_y));

    // Update enemy positions
    for (const enemy of gameState.enemies) {
        enemy.pos_x += enemy.direction[0] * 2; // Enemy speed
        enemy.pos_y += enemy.direction[1] * 2;

        // Bounce enemies back when they hit canvas edges
        if (enemy.pos_x < 0 || enemy.pos_x > canvas.width) enemy.direction[0] *= -1;
        if (enemy.pos_y < 0 || enemy.pos_y > canvas.height) enemy.direction[1] *= -1;
    }
}

// Draw the game state
function drawGameState(ctx) {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // player
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(gameState.player.pos_x, gameState.player.pos_y, 15, 0, Math.PI * 2);
    ctx.fill();

    // enemies
    ctx.fillStyle = "red";
    for (const enemy of gameState.enemies) {
        ctx.beginPath();
        ctx.arc(enemy.pos_x, enemy.pos_y, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Game loop
function gameLoop() {
    updateGameState();
    drawGameState(ctx);
    requestAnimationFrame(gameLoop);
}


const canvasContainer = document.getElementById("gamecanvas");
canvasContainer.innerHTML = "";
const canvas = document.createElement("canvas");
canvas.width = 1000;
canvas.height = 700;
canvasContainer.appendChild(canvas);
const ctx = canvas.getContext("2d");
console.log("Canvas placed inside #gamecanvas successfully!");


gameLoop();
