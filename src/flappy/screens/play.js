import { Screen } from './screen';
import { PauseScreen } from './pause';
import { ScoreScreen } from './score';

import entities from '../entities';
import display from 'display';

export class PlayScreen extends Screen {
  constructor(game) {
    super(game);

    this.view = {
      y: 0,
      x: 0,
      width: display.target.width,
      height: display.target.height,
    };

    this.world = new entities.World(this.view.width, this.view.height);

    this.spriteSheet = this.game.assets['spritesheet/sprite'];
    this.tileSheet = this.game.assets['tilesheet/tiles'];
    this.backgroundImage = this.game.assets['image/background'];

    this.flapSound = this.game.assets['sound/flap'];
    this.deathSound = this.game.assets['sound/death'];
    this.scoreSound = this.game.assets['sound/score'];

    this.on('keydown', function (key) {
      this.world.bird.flap();
    });

    var game = this.game;
    this.on('blur', function (key) {
      game.pushScreen(new PauseScreen(this.game, game));
    });
    
    this.world.bird.on('flap', function() {
      this.flapSound.play();
    }.bind(this))

    this.world.bird.on('die', function() {
      this.deathSound.play();
    }.bind(this))
    
    this.world.on('score', function() {
      this.scoreSound.play();
    }.bind(this));

    this.world.on('defeat', function() {
      this.game.pushScreen(new ScoreScreen(this.game, this));
    }.bind(this));
    
    this.setView(this.world.bird);
    this.world.bird.flap();
  }

  setView(obj) {
    this.view.y = -this.view.height;
    this.view.x = Math.floor(obj.x) + Math.min(-75, -(this.view.width - 300));
  }

  step(time) {
    this.world.step(time);
  }

  draw(time) {
    this.setView(this.world.bird);
      
    display.clear();

    // Draw the background
    display.drawImage(
      this.backgroundImage,
      0, 0, display.target.width, display.target.height,
      0, 0, display.target.width, display.target.height
    );

    // Draw the map.
    // start and end indices based on where the camera is looking at.
    var offset = Math.floor(this.view.x / this.world.terrain.cellSize);
    var count = Math.round(this.view.width / this.world.terrain.cellSize) + 2;

    var startX = offset - count;
    var startY = 0;
    var endX = offset + count;
    var endY = this.world.terrain.rows;

    var rows = this.world.terrain.rows;
    var columns = this.world.terrain.columns;
    var data = this.world.terrain.cells;
    var cellSize = this.world.terrain.cellSize;

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
    if (this.world.bird.dead) {
      this.spriteAnimationName = 'dead';
    } else if (this.world.bird.velocity.y > 0) {
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

    var x = (this.world.bird.x + -this.view.x) - (width / 2);
    var y = (-this.world.bird.y + display.target.height) - (height / 2);

    display.drawImage(this.spriteSheet.image, x, y, width, height, frame.left, frame.top, width, height);

    if (this.game.currentScreen == this) {
      display.reset();
      display.drawText('44px munro', `${this.world.score}`, display.target.width / 2, 100, 'white', 'center');
    }
  }
}
