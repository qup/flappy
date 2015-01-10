import { SpriteSheet } from './sprite_sheet';
import { TileSheet } from './tile_sheet';
import { Howl } from 'howler';
import { Terrain } from './terrain';
import { Bird } from './bird';
import { Vec2 } from './vec2';
import { TitleScreen } from './screens';

import window from './window';

export class Game {
   constructor(element) {
      this.screens = new Array();
      this.accumulator = 0;

      var target = this;
      ['keydown'].forEach(function(event) {
         window.on('keydown', function(...args) {
            target.delegate(event, args);
         });
      });
      
      window.requestRedraw(Game.prototype.tick.bind(this));

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
            that.pushScreen(new TitleScreen(that));
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

   pushScreen(screen) {
      this.screens.push(screen);
   }

   popScreen() {
      if (this.screens.length > 0) {
         this.screens[this.screens.length - 1].dispose();
         var screen = this.screens.pop();

         if (this.screens.length > 0) {
            this.screens[this.screens.length - 1].resume();
         }

         return screen;
      }
   }

   changeScreen(screen) {
      while(this.screens.length > 0) {
         this.screens[this.screens.length - 1].dispose();
         this.screens.pop();
      }

      this.pushScreen(screen);
   }

   get currentScreen() {
      return this.screens[this.screens.length - 1];
   }

   delegate(event, ...args) {
      if (this.screens.length > 0) {
         this.screens[this.screens.length - 1].emit(event, args);
      }
   }

   draw(time) {
      if (this.screens.length > 0) {
         this.screens[this.screens.length - 1].draw(time);
      }
   }

   step(time) {
      if (this.screens.length > 0) {
         this.screens[this.screens.length - 1].step(time);
      }
   }

   tick(time) {
      if (time == undefined) {
         time = global.window.performance.now();
      }

      var frameTime = (time - (this.time || time)) / 1000;
      this.time = time;

      this.step(frameTime);
      this.draw(frameTime);

      if (window.focused) {
         window.requestRedraw(Game.prototype.tick.bind(this));
      } else {
         global.window.setTimeout(Game.prototype.tick.bind(this), 500);
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
