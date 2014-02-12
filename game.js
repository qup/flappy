var Bird = (function() {
   var position;
   var velocity;
   var radius;
   var dead;

   function Bird(x, y, radius) {
      this.position = new Vec2(x, y);
      this.velocity = new Vec2(0, 0);
      this.radius = radius;
      this.dead = false;
   }

   Object.defineProperty(Bird.prototype, 'x', {
      get: function () {
         return this.position.x;
      },
      enumerable: true,
      configurable: true
   });

   Object.defineProperty(Bird.prototype, 'y', {
      get: function () {
         return this.position.y;
      },
      enumerable: true,
      configurable: true
   });

   Bird.prototype.step = function(dt) {
      var gravity = -1000;

      // apply forces.
      this.velocity.y += gravity * dt;

      // terminal velocity:
      var max = 1500;
      if (this.velocity.y < -max) {
         this.velocity.y = -max;
      }

      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
   };

   Bird.prototype.flap = function() {
      // Dead birds don't flap.
      if (this.dead) {
         return;
      }

      this.velocity.y = 450;
      this.velocity.x = 150;
   };

   Bird.prototype.die = function() {
      if (this.dead) {
         return;
      }

      this.dead = true;
      this.velocity.x = 0;
   };

   return Bird;
})();

var Terrain = (function() {
   var rows, columns;
   var cells;
   var cellSize;

   function Terrain(columns, rows, cellSize, bleed) {
      this.rows = rows;
      this.columns = columns;
      this.cellSize = cellSize;
      this.cells = new Array(rows * columns);

      this.fill(0, 0, this.columns, this.rows, -1);
      this.fill(0, 0, this.columns, 1, 8);
      this.generate(bleed, this.columns);
   }

   Terrain.prototype.generate = function(i, length) {
      while(i < length) {
         var width = Math.floor(Math.random() * (6 - 2 + 1)) + 2;

         while (i + width > this.columns) {
            width--;
         }

         this.generateObstacle(i, i + width, 6);


         var seperation = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
         i += width + seperation;
      }
   }

   Terrain.prototype.fill = function(x, y, width, height, value) {
      for (var col = x; col < width; col++) {
         for (var row = y; row < height; row++) {
            this.cells[row * this.columns + col] = value;
         }
      }
   };

   Terrain.prototype.generateObstacle = function(start, end, distance) {
      var min = Math.floor(Math.random() * (this.rows - distance));
      var max = min + distance;

      for (var col = start; (col < end) && (col < this.columns); col++) {
         for (var row = 0; row < this.rows; row++) {
            var value;

            // if it falls within the gap distance, it is an 'air' cell.
            if (row > min && row < max) {
               value = 0;
            } else {
               // otherwise, it is some sort of solid tile, determine which.
               // default to center block.
               value = 5;

               // check for edges
               if (col == start) {
                  // left edge
                  value = 4;

                  if (row == min) {
                     value = 7;
                  } else if (row == max) {
                     value = 1;
                  }
               } else if(col == end) {
                  value = 6;

                  if (row == min) {
                     value = 9;
                  } else if(row == max) {
                     value = 3;
                  }
               } else {
                  if (row == min) {
                     value = 8;
                  } else if(row == max) {
                     value = 2;
                  }
               }
            }

            this.cells[row * this.columns + col] = value;
         }
      }
   };

   // Returns the value at the given world coordiantes.
   //
   Terrain.prototype.queryAt = function(x, y) {
      var col = Math.floor(x / this.cellSize);
      var row = Math.floor(y / this.cellSize);

      return this.valueAt(col, row);
   }

   // Returns the value at the given cell coordinates.
   Terrain.prototype.valueAt = function(x, y) {
      return this.cells[this.indexAt(x, y)];
   };

   // Returns the index of the given cell coordinates
   Terrain.prototype.indexAt = function(col, row) {
      return row * this.columns + col;
   };

   Terrain.prototype.intersects = function(obj) {
      // determine which cell the object is in.
      var col = Math.floor(obj.x / this.cellSize);
      var row = Math.floor(obj.y / this.cellSize);

      // number of cells to check.
      var count = 2; // Math.ceil(obj.radius / this.cellSize);

      for (var i = (col - count); i < (col + count); i++) {
         for (var j = (row - count); j < (row + count); j++) {
            if (Math.floor(this.valueAt(i, j)) > 0) {

               // center of the cell in world space.
               var x = i * this.cellSize;
               var y = j * this.cellSize;

               var distance = Math.sqrt((x -= obj.x) * x + (y -= obj.y) * y);

               if (distance < (this.cellSize / 2) + obj.radius) {

                  //this.cells[this.indexAt(i, j)] = -1;
                  return true;
               }
            }
         }
      }

      return false;
   };

   return Terrain;
})();

var Game = (function() {
   var canvas;
   var bird;
   var terrain;
   var score;
   var highscore;

   var state;
   var input;

   var tileSheet;

   var spriteSheet;
   var spriteAnimationName;
   var spriteAnimationFrame;
   var spriteAnimationTime;

   var backgroundImage;

   var flapSound;
   var deathSound;
   var scoreSound;

   function Game(parent) {
      this.canvas = this.createCanvas(parent);
      this.highscore = window.localStorage.getItem('highscore') || 0;

      this.input = {
         flapping: false,
      };

      var that = this;
      ['mousedown', 'keydown', 'touchstart', 'touchmove'].forEach(function(type) {
         document.addEventListener(type, Game.prototype.handleEvent.bind(that));
      });

      this.preload();
      window.requestAnimationFrame(Game.prototype.tick.bind(that));
   }

   Game.prototype.createCanvas = function(parent) {
      var canvas = document.createElement('canvas');

      canvas.width = 320;
      canvas.height = 480;

      parent.appendChild(canvas);

      return canvas;
   };

   Game.prototype.handleEvent = function(event) {

      if (event.type == 'mousedown' || event.type == 'keydown' || event.type == 'touchstart') {
         if (this.state == 'start') {
            this.startGame();
         } else if (this.state == 'end') {
            this.prepareGame();
         } else if (this.state == 'play') {
            this.input.flapping = true;
         }
      }

      event.preventDefault();
   };

   Game.prototype.preload = function() {
      this.state = 'preload';


      var filesLoaded = 0;
      var filesTotal = 0;

      var that = this;
      var loadCallback = function(event) {
         filesLoaded++;

         if (filesLoaded >= filesTotal) {
            that.prepareGame();
         }
         console.log('loaded file, %i remaining', filesTotal - filesLoaded);
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
         var audio = new Audio();

         audio.addEventListener('canplaythrough', loadCallback, false);
         audio.src = uri;
         audio.load();

         return audio;
      };

      filesTotal = 6;

      this.tileSheet = loadTileSheet('tilesheets/tiles.json');
      this.spriteSheet = loadSpriteSheet('spritesheets/sprite.json');
      this.backgroundImage = loadImage('images/background.png');

      this.flapSound = loadAudio('sounds/flap.wav');
      this.deathSound = loadAudio('sounds/death.wav');
      this.scoreSound = loadAudio('sounds/score.wav');
   };

   Game.prototype.prepareGame = function() {
      this.state = 'start';

      var cellSize = 32;

      this.score = 0;
      this.bird = new Bird(this.canvas.width / 2, this.canvas.height / 2, 16);

      this.terrain = new Terrain((this.canvas.width / cellSize) * 24, (this.canvas.height / cellSize), cellSize, Math.floor(this.canvas.width / cellSize) * 1.5, 10);
   };

   Game.prototype.startGame = function() {
      this.state = 'play';
      this.input.flapping = true;
   };

   Game.prototype.endGame = function() {
      this.state = 'end';

      if (this.score > this.highscore) {
         this.highscore = this.score;

         window.localStorage.setItem('highscore', this.highscore);
      }
   };

   Game.prototype.step = function(dt) {
      if (this.state == 'play') {
         if (this.input.flapping) {
            this.bird.flap();
            this.input.flapping = false;

            this.flapSound.cloneNode().play();
         }
      }

      if (this.state == 'play' || this.state == 'end') {
         var block = this.terrain.queryAt(this.bird.x, this.bird.y);
         var position = this.bird.position.clone();

         this.bird.step(dt);

         if (this.bird.y > this.canvas.height - (this.bird.radius * 2)) {
            this.bird.velocity.y = -100;
         }

         if (this.terrain.intersects(this.bird)) {
            if (!this.bird.dead) {
               this.bird.die();
               this.deathSound.cloneNode().play();
            }

            this.bird.position = position.clone();

            var that = this;
            that.endGame();
         } else if (this.terrain.queryAt(this.bird.x, this.bird.y) != block && block == 0) {
            this.scoreSound.cloneNode().play();
            this.score++;
         }
      }


   };

   Game.prototype.draw = function(dt) {
      var context = this.canvas.getContext('2d');

      context.canvas.width = context.canvas.width;

      if (this.state == 'preload') {
         context.font = '20pt Arial';
         context.textAlign = 'center';
         context.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 8);

         return;
      }

      // Draw the background
      context.drawImage(this.backgroundImage, 0, 0, this.backgroundImage.width, this.backgroundImage.height, 0, 0, context.canvas.width, context.canvas.height);

      context.translate(Math.floor((context.canvas.width / 4) - this.bird.x), Math.floor(context.canvas.height) - this.terrain.cellSize / 2);

      // Draw the map.
      // start and end indices based on where the camera is looking at.
      var start = Math.max(0, Math.floor((this.bird.x / this.terrain.cellSize) - (context.canvas.width / 4) / this.terrain.cellSize));
      var end = Math.min(this.terrain.columns, start + (this.canvas.width / this.terrain.cellSize) * 2);

      context.drawTiles(this.tileSheet, this.terrain.cells, this.terrain.columns, start, 0, end, this.terrain.rows);

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

      this.spriteAnimationTime += dt;
      if (this.spriteAnimationTime > 0.05) {
         this.spriteAnimationFrame++;
         this.spriteAnimationTime = 0;

         if (this.spriteAnimationFrame >= this.spriteSheet.animations[this.spriteAnimationName].length) {
            this.spriteAnimationFrame = 0;
         }
      }

      var animation = this.spriteSheet.animations[this.spriteAnimationName];
      var index = animation[this.spriteAnimationFrame];

      context.drawSprite(this.spriteSheet, index, this.bird.x, -this.bird.y, 70, 32);

      // Draw the score
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.font = '32px munro';
      context.textAlign = 'center';

      if (this.state == 'play') {
         context.fillText(this.score.toString(), context.canvas.width / 2, context.canvas.height / 8);
      } else if (this.state == 'start') {
         context.fillText('Tap to start', context.canvas.width / 2, context.canvas.height / 8);
      } else if(this.state == 'end') {
         context.textAlign = 'center';

         context.fillStyle = 'black';
         context.font = '36px munro';
         context.fillText('Game Over', context.canvas.width / 2, context.canvas.height / 8);

         var top = context.canvas.height / 4;

         context.font = '24px munro';
         context.fillText('Score', context.canvas.width / 2, top);
         top += 24;

         context.fillText(this.score.toString(), context.canvas.width / 2, top);
         top += 34;

         context.fillText('Best', context.canvas.width / 2, top);
         top += 24;

         context.fillText(this.highscore.toString(), context.canvas.width / 2, top);
      }
   };

   Game.prototype.tick = function(time) {
      var accumulator = 0;
      var previousTime = null;

      // integrate at 120 steps per second.
      var dt = 1 / 120;

      var callback = function(timestamp) {
         var currentTime = (timestamp / 1000);
         var frameTime = (currentTime - (previousTime || currentTime));
         previousTime = currentTime;

         accumulator += frameTime;

         while ( accumulator >= dt ) {
            accumulator -= dt;
            this.step(dt);
         }

         this.draw(frameTime);

         window.requestAnimationFrame(callback.bind(this));
      };

      return callback;
   }();

   return Game;
})();

