// ---------------------------------------------------------
//             ENTITY CLASS (Parent of all life)
// ---------------------------------------------------------
class Entity {
  constructor(gridSize, cols, rows, startCol, startRow, topLeftX, topLeftY) {
    this.gridSize = gridSize;
    this.cols = cols;
    this.rows = rows;
    this.topLeftX = topLeftX;
    this.topLeftY = topLeftY;

    this.col = startCol;
    this.row = startRow;

    // For "lerping" movement
    this.oldCol = startCol;
    this.oldRow = startRow;
    this.newCol = startCol;
    this.newRow = startRow;
    this.t = 0;
    this.moveSpeed = 0.1;
    this.moving = false;

    this.direction = [0, 0];
  }

  setDirection(dir) {
    this.direction = dir;
  }

  startMove() {
    if (this.moving) return;

    const targetCol = this.col + this.direction[0];
    const targetRow = this.row + this.direction[1];

    // Boundary checks
    if (targetCol < 0 || targetCol >= this.cols) return;
    if (targetRow < 0 || targetRow >= this.rows) return;

    // Prepare for lerp
    this.oldCol = this.col;
    this.oldRow = this.row;
    this.newCol = targetCol;
    this.newRow = targetRow;
    this.t = 0;
    this.moving = true;
  }

  update() {
    if (!this.moving) return;

    this.t += this.moveSpeed;
    if (this.t >= 1) {
      this.t = 1;
      this.col = this.newCol;
      this.row = this.newRow;
      this.moving = false;
    }
  }

  stop() {
    this.direction = [0, 0];
  }

  // Helpers to get pixel position for drawing
  getX() {
    const colPos = this.oldCol + (this.newCol - this.oldCol) * this.t;
    return this.topLeftX + (colPos + 0.5) * this.gridSize;
  }
  getY() {
    const rowPos = this.oldRow + (this.newRow - this.oldRow) * this.t;
    return this.topLeftY + (rowPos + 0.5) * this.gridSize;
  }
}

// ---------------------------------------------------------
//             PLAYER CLASS (Child of Entity)
// ---------------------------------------------------------
class Player extends Entity {
  constructor(gridSize, cols, rows, startCol, startRow, topLeftX, topLeftY) {
    super(gridSize, cols, rows, startCol, startRow, topLeftX, topLeftY);
    this.health = 3;
    this.score = 0;
  }
}

// ---------------------------------------------------------
//              ENEMY CLASS (Child of Entity)
// ---------------------------------------------------------
class Enemy extends Entity {
  constructor(gridSize, cols, rows, topLeftX, topLeftY) {
    const randCol = Math.floor(Math.random() * cols);
    const randRow = Math.floor(Math.random() * rows);
    super(gridSize, cols, rows, randCol, randRow, topLeftX, topLeftY);

    this.randomDirections = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];

    // Cooldown so enemies move in discrete "steps"
    this.moveCooldown = 0;
    this.moveCooldownMax = 120;

    // movementType can be "random" or "chase"
    this.movementType = "random";
  }

  /**
   * Update enemy logic; pass in the player so we can chase them.
   * @param {Player} player
   */
  update(player) {
    super.update();

    // If still moving on the grid, wait until done
    if (this.moving) return;

    // Check cooldown
    if (this.moveCooldown > 0) {
      this.moveCooldown--;
      return;
    }

    // Decide direction
    if (this.movementType === "random") {
      const choice = Math.floor(Math.random() * this.randomDirections.length);
      this.setDirection(this.randomDirections[choice]);
    } else if (this.movementType === "chase" && player) {
      // Simple chase logic: move along whichever axis is further from player
      console.log("chasing")
      const dCol = player.col - this.col;
      const dRow = player.row - this.row;

      if (Math.abs(dCol) > Math.abs(dRow)) {
        this.setDirection([dCol > 0 ? 1 : -1, 0]);
      } else {
        this.setDirection([0, dRow > 0 ? 1 : -1]);
      }
    }

    // Start the move
    this.startMove();
    this.moveCooldown = this.moveCooldownMax;
  }
}

// ---------------------------------------------------------
//                         GAME CLASS
// ---------------------------------------------------------
class Game {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;

    // Playable grid region
    this.topLeftX = 0;
    this.topLeftY = 75;
    this.regionWidth = canvas.width - 250;
    this.regionHeight = canvas.height - 75;

    this.gridSize = 50;
    this.cols = Math.floor(this.regionWidth / this.gridSize);
    this.rows = Math.floor(this.regionHeight / this.gridSize);

    // Create player in center
    const startCol = Math.floor(this.cols / 2);
    const startRow = Math.floor(this.rows / 2);
    this.player = new Player(
      this.gridSize,
      this.cols,
      this.rows,
      startCol,
      startRow,
      this.topLeftX,
      this.topLeftY
    );

    // Multiple enemies
    this.enemies = [];
  }

  addEnemy() {
    const enemy = new Enemy(this.gridSize, this.cols, this.rows, this.topLeftX, this.topLeftY);
    this.enemies.push(enemy);
  }

  removeEnemy() {
    if (this.enemies.length > 0) {
      this.enemies.pop();
    }
  }

  update() {
    // Update player
    this.player.update();

    // Update enemies, pass the player reference
    for (const enemy of this.enemies) {
      enemy.update(this.player);
    }
  }

  draw() {
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    // Draw player
    this.ctx.fillStyle = "blue";
    this.ctx.beginPath();
    this.ctx.arc(this.player.getX(), this.player.getY(), 15, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw enemies
    this.ctx.fillStyle = "green";
    for (const enemy of this.enemies) {
      this.ctx.beginPath();
      this.ctx.arc(enemy.getX(), enemy.getY(), 15, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawGrid() {
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 1;
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "white";

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = this.topLeftX + col * this.gridSize;
        const y = this.topLeftY + row * this.gridSize;
        this.ctx.strokeRect(x, y, this.gridSize, this.gridSize);

        const coord = `${String.fromCharCode(65 + row)}${col + 1}`;
        const textX = x + this.gridSize / 2;
        const textY = y + this.gridSize / 2;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(coord, textX, textY);
      }
    }
  }
}

// ---------------------------------------------------------
//                  Canvas + Game Loop
// ---------------------------------------------------------
const canvasContainer = document.getElementById("gamecanvas");
canvasContainer.innerHTML = "";
const canvas = document.createElement("canvas");
canvas.width = 1000;
canvas.height = 700;
canvasContainer.appendChild(canvas);
const ctx = canvas.getContext("2d");

const game = new Game(ctx, canvas);

// Keyboard
document.addEventListener("keydown", (event) => {
  // Don’t set direction if the player is already moving
  if (game.player.moving) return;

  if (event.key === "ArrowUp")    game.player.setDirection([0, -1]);
  if (event.key === "ArrowDown")  game.player.setDirection([0,  1]);
  if (event.key === "ArrowLeft")  game.player.setDirection([-1, 0]);
  if (event.key === "ArrowRight") game.player.setDirection([1,  0]);

  // Move player
  game.player.startMove();

  // Enemy hotkeys (+ / -)
  if (event.key === "+" || event.key === "=") {
    game.addEnemy();
  }
  if (event.key === "-") {
    game.removeEnemy();
  }
});

document.addEventListener("keyup", () => {
  game.player.stop();
});

// Main loop
function gameLoop() {
  game.update();
  game.draw();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

/* Listen for the dropdown's change and switch all existing
   enemies to either "random" or "chase" */
const movementSelect = document.getElementById("movementSelect");
movementSelect.addEventListener("change", function(e) {
  const selectedMode = e.target.value;
  for (let enemy of game.enemies) {
    enemy.movementType = selectedMode;
  }
});
