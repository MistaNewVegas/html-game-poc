// Initial game state
const gameState = {
    player: {
        health: 3,
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
    gameState.player.pos_x += gameState.player.direction[0] * 3; // speed 
    gameState.player.pos_y += gameState.player.direction[1] * 3;

    // Ensure the player stays within bounds
    gameState.player.pos_x = Math.max(0, Math.min(canvas.width-250, gameState.player.pos_x));
    gameState.player.pos_y = Math.max(75, Math.min(canvas.height, gameState.player.pos_y));

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

}

// Draw a grid of red squares within the defined region
function drawGrid() {
    const squareSize = 50; // Size of each square

    // Define the region
    const startX = 0; // 75% of canvas width
    const endX = 0.75 * canvas.width; // Rightmost edge of the canvas

    const startY = (55 / 775) * canvas.height; // 55/775 of canvas height
    const endY = canvas.height; // Bottom edge of the canvas

    // Calculate rows and columns that fit in the region
    const cols = Math.floor((endX - startX) / squareSize);
    const rows = Math.floor((endY - startY) / squareSize);

    // Draw the grid
    ctx.strokeStyle = "red"; // Red border
    ctx.lineWidth = 1; // 1px border thickness
    ctx.font = "16px Arial"; // Font for text
    ctx.fillStyle = "white"; // Text color

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = startX + col * squareSize; // X position of square
            const y = startY + row * squareSize; // Y position of square

            // Draw the outlined square
            ctx.strokeRect(x, y, squareSize, squareSize);

            // Generate alphanumeric coordinates
            const coord = `${String.fromCharCode(65 + row)}${col + 1}`; // A1, B1, etc.

            // Calculate text position (center of the square)
            const textX = x + squareSize / 2;
            const textY = y + squareSize / 2;

            // Draw the coordinates in the center of the square
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(coord, textX, textY);
        }
    }
}



// Game loop
function gameLoop() {
    updateGameState();
    drawGameState(ctx);
    drawGrid();
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
