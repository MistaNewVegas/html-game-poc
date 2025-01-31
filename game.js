      // ---------------------------------------------------------
      //             ENTITY CLASS (Parent of all life)
      // ---------------------------------------------------------
    class Entity {
        /**
         * @param {number} gridSize   Size of each square in pixels
         * @param {number} cols       Number of columns in the playable grid region
         * @param {number} rows       Number of rows in the playable grid region
         * @param {number} startCol   Starting column
         * @param {number} startRow   Starting row
         * @param {number} topLeftX   X offset where the grid region starts
         * @param {number} topLeftY   Y offset where the grid region starts
         */
        constructor(gridSize, cols, rows, startCol, startRow, topLeftX, topLeftY) {
          this.gridSize = gridSize;
          this.cols = cols;
          this.rows = rows;
          this.topLeftX = topLeftX;
          this.topLeftY = topLeftY;
  

          this.col = startCol;
          this.row = startRow;
  
          // LERP setup
          this.oldCol = startCol;
          this.oldRow = startRow;
          this.newCol = startCol;
          this.newRow = startRow;
          this.t = 0;
          this.moveSpeed = 0.1;
          this.moving = false;
  
        // dx dy
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
  
          // Set up for LERP
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
  
        // Convert grid positions to pixel coordinates 4 lerp
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
          // player specific properties
        }
        // further ovverrides can go here
      }
  
      // ---------------------------------------------------------
      //              ENEMY CLASS (Child of Entity)
      // ---------------------------------------------------------
      class Enemy extends Entity {
        constructor(gridSize, cols, rows, topLeftX, topLeftY) {
          // Choose random spawn within the grid
          const randCol = Math.floor(Math.random() * cols);
          const randRow = Math.floor(Math.random() * rows);
          super(gridSize, cols, rows, randCol, randRow, topLeftX, topLeftY);
  
          // Potential movement directions: up, down, left, right
          this.randomDirections = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
          ];
            // Cooldown timer properties
            this.moveCooldown = 0;       // current countdown
            this.moveCooldownMax = 60;   // frames or updates to wait between moves
        }

        update() {
            // Run parent logic
            super.update();

            // If the enemy is in the middle of moving, just let it finish
            if (this.moving) return;

            // If not moving, check cooldown
            if (this.moveCooldown > 0) {
            // Still in cooldown, decrement
            this.moveCooldown--;
            } else {
            // Cooldown is done, pick random direction
            const choice = Math.floor(Math.random() * this.randomDirections.length);
            this.setDirection(this.randomDirections[choice]);

            // Start the move (Entity's method)
            this.startMove();

            // Reset cooldown so next move is delayed
            this.moveCooldown = this.moveCooldownMax;
            }
        }
    }
  
      // ---------------------------------------------------------
      //                         GAME CLASS
      // ---------------------------------------------------------
      class Game {
        constructor(ctx, canvas) {
          this.ctx = ctx;
          this.canvas = canvas;
  
          // Boundaries for the playable grid region
          this.topLeftX = 0;
          this.topLeftY = 75;
          this.regionWidth = this.canvas.width - 250;
          this.regionHeight = this.canvas.height - 75;
  
          this.gridSize = 50;
  
          // Compute how many columns & rows fit in the region
          this.cols = Math.floor(this.regionWidth / this.gridSize);
          this.rows = Math.floor(this.regionHeight / this.gridSize);
  
          // Start the player near the middle cell
          const startCol = Math.floor(this.cols / 2);
          const startRow = Math.floor(this.rows / 2);
  
          // Create the Player
          this.player = new Player(
            this.gridSize,
            this.cols,
            this.rows,
            startCol,
            startRow,
            this.topLeftX,
            this.topLeftY
          );
  
          // Array to store multiple Enemy objects
          this.enemies = [];
        }
  
        // Create and add a new enemy
        addEnemy() {
          const enemy = new Enemy(this.gridSize, this.cols, this.rows, this.topLeftX, this.topLeftY);
          this.enemies.push(enemy);
        }
  
        // Remove the last-added enemy (if any exist)
        removeEnemy() {
          if (this.enemies.length > 0) {
            this.enemies.pop();
          }
        }
  
        update() {
          // Update player
          this.player.update();
  
          // Update each enemy
          for (let e of this.enemies) {
            e.update();
          }
        }
  
        draw() {
          // Clear canvas
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
          // Draw the grid
          this.drawGrid();
  
          // Draw the player (blue circle)
          this.ctx.fillStyle = "blue";
          this.ctx.beginPath();
          this.ctx.arc(this.player.getX(), this.player.getY(), 15, 0, Math.PI * 2);
          this.ctx.fill();
  
          // Draw each enemy (green circle)
          this.ctx.fillStyle = "green";
          for (let enemy of this.enemies) {
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
              // Each cell is offset by topLeftX, topLeftY
              const x = this.topLeftX + col * this.gridSize;
              const y = this.topLeftY + row * this.gridSize;
  
              // Draw the cell
              this.ctx.strokeRect(x, y, this.gridSize, this.gridSize);
  
              // Optional coordinate label: A1, A2, ...
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
      //  5) SETUP CANVAS & START THE GAME LOOP
      // ---------------------------------------------------------
      const canvasContainer = document.getElementById("gamecanvas");
      canvasContainer.innerHTML = "";
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 700;
      canvasContainer.appendChild(canvas);
      const ctx = canvas.getContext("2d");
  
      const game = new Game(ctx, canvas);
  
      // Key handling
      document.addEventListener("keydown", (event) => {
        // Don’t set direction if the player is already moving
        if (game.player.moving) return;
  
        if (event.key === "ArrowUp")    game.player.setDirection([0, -1]);
        if (event.key === "ArrowDown")  game.player.setDirection([0,  1]);
        if (event.key === "ArrowLeft")  game.player.setDirection([-1, 0]);
        if (event.key === "ArrowRight") game.player.setDirection([1,  0]);
  
        // Start the player move (if valid)
        game.player.startMove();
  
        // Hotkeys to add/remove enemies
        // (“+” key can appear as "+" or "=" on some keyboards)
        if (event.key === "+" || event.key === "=") {
          game.addEnemy();
        }
        if (event.key === "-") {
          game.removeEnemy();
        }
      });
  
      // Keyup: stop direction input, but if mid-lerp, let it finish
      document.addEventListener("keyup", () => {
        game.player.stop();
      });
  
      // Main game loop
      function gameLoop() {
        game.update();
        game.draw();
        requestAnimationFrame(gameLoop);
      }
      requestAnimationFrame(gameLoop);