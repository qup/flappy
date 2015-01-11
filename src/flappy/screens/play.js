import { Screen } from './screen';
import { PauseScreen } from './pause';
import { ScoreScreen } from './score';

import entities from '../entities';
import display from 'display';

export class PlayScreen extends Screen {
  constructor(game) {
    super(game);

    this.score = 0;
    this.input = {
      flapping: false,
    };

    var cellSize = 64;

    this.view = {
      y: 0,
      x: 0,
      width: display.target.width,
      height: display.target.height,
    };

    var columns = Math.round(this.view.width / cellSize) * 4;
    var rows = Math.round(this.view.height / cellSize) + 1;

    this.terrain = new entities.Terrain(columns, rows, cellSize);
    this.terrainBorder = Math.floor((rows - 6) / 2);
    this.terrain.fill(0, 0, columns, rows, -1);
    this.terrain.fill(0, 0, columns, this.terrainBorder - 1, 2);
    this.terrain.fill(0, this.terrainBorder - 1, columns, this.terrainBorder, 1);
    this.generationIndex = 0;

    this.bird = new entities.Bird(this.view.width - 300, this.view.height / 2, 16, 1.31);

    this.setView(this.bird);
    this.input.flapping = true;

    this.spriteSheet = this.game.assets['spritesheet/sprite'];
    this.tileSheet = this.game.assets['tilesheet/tiles'];
    this.backgroundImage = this.game.assets['image/background'];

    this.flapSound = this.game.assets['sound/flap'];
    this.deathSound = this.game.assets['sound/death'];
    this.scoreSound = this.game.assets['sound/score'];

    this.accumulator = 0;

    this.on('keydown', function (key) {
      this.input.flapping = true;
    });

    this.on('blur', function (key) {
      this.game.pushScreen(new GamePauseScreen(this.game, this));
    });
  }

  setView(obj) {
    this.view.y = -this.view.height;
    this.view.x = Math.floor(obj.x) + Math.min(-75, -(this.view.width - 300));
  }

  step(time) {
    var dt = 1 / 120;
    this.accumulator += time;

    while (this.accumulator >= dt) {
      this.accumulator -= dt;
      this.integrate(dt);
    }
  }

  integrate(time) {
    this.setView(this.bird);

    var width = Math.round(this.view.width / this.terrain.cellSize);
    var views = Math.floor(this.terrain.columns / width);

    var column = Math.round((this.view.x + this.view.width) / this.terrain.cellSize);
    var index = (Math.floor(column / width)) % views;

    if (index != this.generationIndex) {
      var start = Math.floor(index * width);

      this.terrain.fill(start, 0, start + width, this.terrain.rows, -1);
      this.terrain.fill(start, 0, start + width, this.terrainBorder - 1, 2);
      this.terrain.fill(start, this.terrainBorder - 1, start + width, this.terrainBorder, 1);
      this.terrain.generate(start + 3, start + width, this.terrainBorder);

      this.generationIndex = index;
      console.info('Regenerating section %i (%i to %i)', index, start, start + width, this.terrain.columns);
    }

    if (this.input.flapping) {
      this.bird.flap();
      this.input.flapping = false;

      this.flapSound.play();
    }

    if (this.bird.position.x > (this.terrain.columns * this.terrain.cellSize)) {
      this.bird.position.x -= this.bird.position.x;
      console.info('Transporting player');
    }


    if (this.bird.y > this.view.height - (this.bird.radius * 2)) {
      this.bird.velocity.y = -100;
    }

    this.bird.step(time);

    var block = this.terrain.queryAt(this.bird.x, this.bird.y);
    if (block == 0) {
      this.canScore = true;
    } else if (block == -1 && this.canScore) {
      this.score++;
      this.canScore = false;

      this.scoreSound.play();
    }


    if (!this.bird.dead) {
      if (this.terrain.intersects(this.bird)) {
        this.bird.die();
        this.deathSound.play();
        console.info('Player died, %i, %i', this.bird.x / this.terrain.cellSize, this.bird.y / this.terrain.cellSize);
        this.game.pushScreen(new ScoreScreen(this.game, this));
      }

    }
  }

  draw(time) {
    display.clear();

    // Draw the background
    display.drawImage(
      this.backgroundImage,
      0, 0, display.target.width, display.target.height,
      0, 0, display.target.width, display.target.height
    );


    // Draw the map.
    // start and end indices based on where the camera is looking at.
    var offset = Math.floor(this.view.x / this.terrain.cellSize);
    var count = Math.round(this.view.width / this.terrain.cellSize) + 2;

    var startX = offset - count;
    var startY = 0;
    var endX = offset + count;
    var endY = this.terrain.rows;

    var rows = this.terrain.rows;
    var columns = this.terrain.columns;
    var data = this.terrain.cells;
    var cellSize = this.terrain.cellSize;

    var tileWidth = this.tileSheet.image.width / this.tileSheet.columns;
    var tileHeight = this.tileSheet.image.height / this.tileSheet.rows;

    for (var x = startX; x < endX; x++) {
      for (var y = startY; y < endY; y++) {
        var col = (x < 0) ? columns + x : x % columns;
        var row = (y < 0) ? rows + y : y % rows;

        var i = data[row * columns + col];

        if (i < 0) {
          continue;
        }

        var sx = (i % (this.tileSheet.image.width / tileWidth)) * tileWidth;
        var sy = Math.floor(i / (this.tileSheet.image.width / tileWidth)) * tileHeight;

        display.drawImage(
          this.tileSheet.image, (x * cellSize) - (cellSize / 2) + -this.view.x, -((y * cellSize) - display.target.height) - (cellSize / 2), cellSize, cellSize,
          sx, sy, tileWidth, tileHeight);
      }
    }



    // Animate and draw the player.
    var animationName = this.spriteAnimationName;
    if (this.bird.dead) {
      this.spriteAnimationName = 'dead';
    } else if (this.bird.velocity.y > 0) {
      this.spriteAnimationName = 'flap';
    } else {
      this.spriteAnimationName = 'idle';
    }

    if (animationName != this.spriteAnimationName) {
      this.spriteAnimationFrame = 0;
      this.spriteAnimationTime = 0;
    }

    this.spriteAnimationTime += time;
    if (this.spriteAnimationTime > 0.05) {
      this.spriteAnimationFrame++;
      this.spriteAnimationTime = 0;

      if (this.spriteAnimationFrame >= this.spriteSheet.animations[this.spriteAnimationName].length) {
        this.spriteAnimationFrame = 0;
      }
    }

    var animation = this.spriteSheet.animations[this.spriteAnimationName];
    var index = animation[this.spriteAnimationFrame];
    var frame = this.spriteSheet.frames[index];

    var height = frame.bottom - frame.top;
    var width = frame.right - frame.left;

    var x = (this.bird.x + -this.view.x) - (width / 2);
    var y = (-this.bird.y + display.target.height) - (height / 2);

    display.drawImage(this.spriteSheet.image, x, y, width, height, frame.left, frame.top, width, height);

    if (this.game.currentScreen == this) {
      display.reset();
      display.drawText('44px munro', `${this.score}`, display.target.width / 2, 100, 'white', 'center');
    }
  }
}
