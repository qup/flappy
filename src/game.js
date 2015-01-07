import { SpriteSheet } from './sprite_sheet';
import { TileSheet } from './tile_sheet';
import { Howl } from './howler';
import { Terrain } from './terrain';
import { Bird } from './bird';
import { Vec2 } from './vec2';

export class GameState {
   constructor(game) {
      this.game = game;
   }
   
   pause() {
   }
   
   resume() {
   }
   
   dispose() {
   }
   
   handleEvent(event) {
   }
   
   step(time) {
   }

   draw(time) {
   }
}


export class GameTitleState extends GameState {
   constructor(game) {
      super(game);

      this.playState = new GamePlayState(game);
   }

   handleEvent(event) {
    switch(event.type) {
         case 'keydown':
            if (event.keyCode == 32) {
               this.game.changeState(this.playState);
               break;
            }
         break;

         case 'mousedown':
            if (event.button == 0) {
               this.game.changeState(this.playState);
               break;
            }
         break;

         case 'touchstart':
            this.game.changeState(this.playState);
         break;
      }
   }
   
   draw(time) {
    var context = this.game.canvas.getContext('2d');

      // Draw the play state.
      this.playState.draw(time);

      // Draw our title overlay.
      context.setTransform(1, 0, 0, 1, 0, 0);

      context.textAlign = 'center';
      context.font = '90px munro';
      context.fillStyle = 'white';
      context.fillText('flappy', context.canvas.width / 2, 100 );

      context.textAlign = 'center';
      context.font = '24px munro';
      context.fillStyle = 'white';
      context.fillText('tap to play', context.canvas.width / 2, 150);
   }
}

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
   }
   
   handleEvent(event) {
     switch(event.type) {
         case 'keydown':
            if (event.keyCode == 32) {
               this.input.flapping = true;
               break;
            }
         break;

         case 'mousedown':
            if (event.button == 0) {
               this.input.flapping = true;
               break;
            }
         break;

         case 'touchstart':
            this.input.flapping = true;
         break;

         case 'blur':
            this.game.pushState(new GamePauseState(this.game, this));
         break;
      }
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

export class GamePauseState extends GameState {
   constructor(game, playState) {
      super(game);
      
      this.playState = playState;
      this.elapsedTime = 0;
   }
   
   handleEvent(event) {
      switch (event.type) {
         case 'focus':
            // Pop self, thus resuming the game play state.
            this.game.popState();
         break;
      }
   }
   
   draw(time) {
      var context = this.game.canvas.getContext('2d');
      var elapsedTime = window.performance.now() / 1000;

      this.playState.draw(time);

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.fillStyle = 'white';
      context.textAlign = 'center';

      context.font = '64px munro';
      context.fillText('Pause', context.canvas.width / 2, context.canvas.height / 2 - 100);
   }
}

export class GameOverState extends GameState {
   constructor(game, playState) {
      super(game, playState);

      this.playState = playState;

      this.highScore = window.localStorage.getItem('highscore') || 0;
      if (this.highScore < this.playState.score) {
         this.highScore = this.playState.score;
         window.localStorage.setItem('highscore', this.highScore);
      }

      console.info('Submitting score');
      this.game.submitScore('score', this.playState.score);

      this.elapsedTime = 0;
   }
   
   
   handleEvent(event) {
     switch(event.type) {
         case 'keydown':
            if (event.keyCode == 32) {
               this.game.changeState(new GameTitleState(this.game));
               break;
            }
         break;

         case 'mousedown':
            this.game.changeState(new GameTitleState(this.game));
         break;

         case 'touchstart':
            this.game.changeState(new GameTitleState(this.game));
         break;
      }
   }
   
   step(time) {
      this.playState.step(time);
   }
   
   draw(time) {
      var context = this.game.canvas.getContext('2d');

      this.playState.draw(time);

      context.setTransform(1, 0, 0, 1, 0, 0);

      this.elapsedTime += time;
      context.globalAlpha = Math.min(0.4, this.elapsedTime / 2);
      context.fillStyle = 'black';
      context.rect(0, 0, context.canvas.width, context.canvas.height);
      context.fill();

      context.globalAlpha = 1.0;

      context.textAlign = 'center';
      context.fillStyle = 'white';
      context.font = '64px munro';
      context.fillText('Game Over!', context.canvas.width / 2, 100);

      context.font = '34px munro';
      context.fillText('Score', context.canvas.width / 2, 200);

      context.fillText(this.playState.score.toString(), context.canvas.width / 2, 245 );

      context.fillText('Best', context.canvas.width / 2, 300);
      context.fillText(this.highScore.toString(), context.canvas.width / 2, 345);
   }   
}

export class Game {
   constructor(element) {
      this.states = new Array();
      this.canvas = document.createElement('canvas');
      this.accumulator = 0;
      this.element = element;

      this.canvas.width = (this.element) ? this.element.clientWidth : window.innerWidth;
      this.canvas.height = (this.element) ? this.element.clientHeight : window.innerHeight;

      window.document.body.appendChild(this.canvas);

      var events = [
         'keydown',
         'keyup',
         'mousedown',
         'mousemove',
         'touchstart',
         'touchmove',
         'touchend',
         'blur',
         'focus',
         'focusin',
         'focusout'
      ];

      for (var i = 0; i < events.length; i++) {
         window.addEventListener(events[i], Game.prototype.handleEvent.bind(this), true);
      }

      window.requestAnimationFrame(Game.prototype.tick.bind(this));

      this.assets = new Object();
      this.preload();
   }
   
   
   preload() {
      var filesLoaded = 0;
      var filesTotal = 0;

      var that = this;
      var loadCallback = function(event) {
         filesLoaded++;

         if (filesLoaded >= filesTotal) {
            that.pushState(new GameTitleState(that));
         }
      };

      var loadTileSheet = function(uri) {
         var tileSheet = new TileSheet();

         tileSheet.addEventListener('load', loadCallback, false);
         tileSheet.src = uri;

         return tileSheet;
      };

      var loadSpriteSheet = function(uri) {
         var spriteSheet = new SpriteSheet();

         spriteSheet.addEventListener('load', loadCallback, false);
         spriteSheet.src = uri;

         return spriteSheet;
      };

      var loadImage = function(uri) {
         var image = new Image();

         image.addEventListener('load', loadCallback, false);
         image.src = uri;

         return image;
      };

      var loadAudio = function(uri) {
         var audio = new Howl({
            urls: [uri],
            onload: loadCallback,
         });

         return audio;
      };

      filesTotal = 6;

      this.assets['tilesheets/tiles'] = loadTileSheet('tilesheets/tiles.json');
      this.assets['spritesheets/sprite'] = loadSpriteSheet('spritesheets/sprite.json');
      this.assets['images/background'] = loadImage('images/background.png');

      this.assets['sounds/flap'] = loadAudio('sounds/flap.wav');
      this.assets['sounds/death'] = loadAudio('sounds/death.wav');
      this.assets['sounds/score'] = loadAudio('sounds/score.wav');
   }

   pushState(state) {
      this.states.push(state);
   }

   popState() {
      if (this.states.length > 0) {
         this.states[this.states.length - 1].dispose();
         var state = this.states.pop();

         if (this.states.length > 0) {
            this.states[this.states.length - 1].resume();
         }

         return state;
      }
   }

   changeState(state) {
      while(this.states.length > 0) {
         this.states[this.states.length - 1].dispose();
         this.states.pop();
      }

      this.pushState(state);
   }

   get currentState() {
      return this.states[this.states.length - 1];
   }

   handleEvent(event) {
      if (this.states.length > 0) {
         this.states[this.states.length - 1].handleEvent(event);
      }
   }

   draw(time) {
      if (this.states.length > 0) {
         this.states[this.states.length - 1].draw(time);
      }
   }

   step(time) {
      if (this.states.length > 0) {
         this.states[this.states.length - 1].step(time);
      }
   }

   tick(time) {
      if (time == undefined) {
         time = window.performance.now();
      }

      var frameTime = (time - (this.time || time)) / 1000;
      this.time = time;

      this.step(frameTime);
      this.draw(frameTime);

      if (window.document.hasFocus()) {
         window.requestAnimationFrame(Game.prototype.tick.bind(this));
      } else {
         window.setTimeout(Game.prototype.tick.bind(this), 500);
      }
   }

   submitScore(key, value) {
      if (window.kongregate) {
         kongregate.stats.submit('leaderboard_' + key, value);
         console.info('Kongregate score submitted');
      } else {
         console.info('No score API available');
      }
   }
}
