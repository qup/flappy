import { Screen } from './screen';
import { Pause } from './pause';
import { Score } from './score';

import entities from '../entities';
import display from 'display';

export class Play extends Screen {
  constructor(game) {
    super(game);

    this.world = new entities.World(320, 480);

    this.spriteSheet = this.game.assets['spritesheet/sprite'];
    this.tileSheet = this.game.assets['tilesheet/tiles'];
    this.backgroundImage = this.game.assets['image/background'];

    this.flapSound = this.game.assets['sound/flap'];
    this.deathSound = this.game.assets['sound/death'];
    this.scoreSound = this.game.assets['sound/score'];

    this.on('keyDown', function (key) {
      this.world.bird.flap();
    });

    var game = this.game;
    this.on('blur', function (key) {
      game.push(new Pause(this.game, game));
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
      this.game.push(new Score(this.game, this));
    }.bind(this));

    this.world.bird.flap();
  }

  step(time) {
    this.world.step(time);
  }

  drawBackground(scale, offsetX, offsetY) {
    display.clear();

    var count = Math.ceil(display.target.width / this.world.width);
    for (var i = 0; i < count; i++) {
      display.drawImage(
        this.backgroundImage,
        i * this.world.width, 0, this.world.width, this.world.height,
        0, 0, this.backgroundImage.width, this.backgroundImage.height,
        scale, scale, 0, 0
      );
    }
  }

  drawTerrain(scale, offsetX, offsetY) {
    var atlas = this.tileSheet;
    var { rows, columns, data, size } = this.world.terrain;

    var startX = Math.floor(-offsetX / size);
    var startY = Math.floor(-offsetY / size);
    var endX = startX + Math.ceil(display.target.width / size);
    var endY = startY + Math.ceil(display.target.height / size);

    var srcWidth = atlas.image.width / atlas.columns;
    var srcHeight = atlas.image.height / atlas.rows;

    for (var x = startX; x < endX; x++) {
      for (var y = startY; y < endY; y++) {
        var col = (x < 0) ? columns + x : x % columns;
        var row = (y < 0) ? rows + y : y % rows;

        var index = data[row * columns + col];

        if (index < 0) {
          continue;
        }

        var srcX = (index % (atlas.image.width / srcWidth)) * srcWidth;
        var srcY = Math.floor(index / (atlas.image.width / srcWidth)) * srcHeight;

        display.drawImage(
          atlas.image,
          (x * size) + offsetX, (-y * size) + offsetY, size, size,
          srcX, srcY, srcWidth, srcHeight,
          scale, scale, size / 2, size / 2
        );
      }
    }
  }

  drawPlayer(time, scale, offsetX, offsetY) {
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

    var x = this.world.bird.x + offsetX;
    var y = -this.world.bird.y + offsetY;

    display.drawImage(
      this.spriteSheet.image,
      x, y, width, height,
      frame.left, frame.top, width, height,
      scale, scale, width / 2, height / 2
    );
  }

  drawOverlay(scale) {
    display.drawText(`44px munro`, `${this.world.score}`, display.target.width / 2, 100, 'white', 'center');
  }

  draw(time) {
    var offsetX = -this.world.bird.x + (this.world.width / 4);
    var offsetY = this.world.height;

    var scaleX = display.target.width / this.world.width;
    var scaleY = display.target.height / this.world.height;
    var scale = Math.min(scaleX, scaleY);

    this.drawBackground(scale, offsetX, offsetY);
    this.drawTerrain(scale, offsetX, offsetY);
    this.drawPlayer(time, scale, offsetX, offsetY);
    this.drawOverlay(scale);
  }
}
