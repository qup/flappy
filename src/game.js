import { SpriteSheet } from './sprite_sheet';
import { TileSheet } from './tile_sheet';
import { Howl } from 'howler';
import { Terrain } from './terrain';
import { Bird } from './bird';
import { Vec2 } from './vec2';
import { GameTitleState } from './states';

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
