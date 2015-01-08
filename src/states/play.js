import { GameState } from './state';
import { GamePauseState } from './pause';
import { GameOverState } from './over';

import { Bird } from '../bird';
import { Terrain } from '../terrain';

export class GamePlayState extends GameState {
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
         width: this.game.canvas.width,
         height: this.game.canvas.height,
      };

      var columns = Math.round(this.view.width / cellSize) * 4;
      var rows = Math.round(this.view.height / cellSize) + 1;

      this.terrain = new Terrain(columns, rows, cellSize);
      this.terrainBorder = Math.floor((rows - 6) / 2);
      this.terrain.fill(0, 0, columns, rows, -1);
      this.terrain.fill(0, 0, columns, this.terrainBorder - 1, 2);
      this.terrain.fill(0, this.terrainBorder - 1, columns, this.terrainBorder, 1);
      this.generationIndex = 0;

      this.bird = new Bird(this.view.width - 300, this.game.canvas.height / 2, 16, 1.31);

      this.setView(this.bird);
      this.input.flapping = true;

      this.spriteSheet = this.game.assets['spritesheets/sprite'];
      this.tileSheet = this.game.assets['tilesheets/tiles'];
      this.backgroundImage = this.game.assets['images/background'];

      this.flapSound = this.game.assets['sounds/flap'];
      this.deathSound = this.game.assets['sounds/death'];
      this.scoreSound = this.game.assets['sounds/score'];

      this.accumulator = 0;
      
      this.on('keydown', function(key) {
         this.input.flapping = true;
      });

      this.on('blur', function(key) {
         this.game.pushState(new GamePauseState(this.game, this));
      });
   }

   setView(obj) {
      this.view.y = -this.game.canvas.height;
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


      if (this.bird.y > this.game.canvas.height - (this.bird.radius * 2)) {
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
            this.game.pushState(new GameOverState(this.game, this));
         }

      }
   }
   
   draw(time) {
      var context = this.game.canvas.getContext('2d');

      context.canvas.width = context.canvas.width;

      // Draw the background
      context.drawImage(this.backgroundImage, 0, 0, this.backgroundImage.width, this.backgroundImage.height, 0, 0, context.canvas.width, context.canvas.height);

      context.translate( -this.view.x, -this.view.y );
      context.translate(0, -this.terrain.cellSize / 2);

      // Draw the map.
      // start and end indices based on where the camera is looking at.
      var offset = Math.floor(this.view.x / this.terrain.cellSize);
      var count = Math.round(this.view.width / this.terrain.cellSize) + 2;

      context.drawTiles(this.tileSheet, this.terrain.cells, this.terrain.columns, this.terrain.rows, offset - count, 0, offset + count, this.terrain.rows, this.terrain.cellSize, this.terrain.cellSize);

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

      context.drawSprite(this.spriteSheet, index, this.bird.x, -this.bird.y, 0, 1);

      if (this.game.currentState == this) {
         context.setTransform(1, 0, 0, 1, 0, 0);

         context.textAlign = 'center';
         context.font = '44px munro';

         context.fillStyle = 'white';
         context.fillText(this.score.toString(), context.canvas.width / 2, 100);
      }
   }
}

