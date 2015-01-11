import { Terrain } from './terrain';
import { Bird } from './bird';
import { Vec2 } from './vec2';
import { TitleScreen } from './screens';

import window from 'window';
import async from 'async';
import asset from './asset';

export class Game {
  constructor(element) {
    this.screens = new Array();

    var target = this;
      ['keydown'].forEach(function (event) {
      window.on('keydown', function (...args) {
        target.delegate(event, args);
      });
    });

    window.requestRedraw(Game.prototype.tick.bind(this));

    this.assets = new Object();
    this.preload();
  }

  preload() {
    var that = this;
    var tasks = async.parallel({
      'tilesheet/tiles': async.apply(asset.loadAtlas, 'tilesheet/tiles.json'),
      'spritesheet/sprite': async.apply(asset.loadAtlas, 'spritesheet/sprite.json'),
      'image/background': async.apply(asset.loadImage, 'image/background.png'),
      'sound/flap': async.apply(asset.loadSound, 'sound/flap.wav'),
      'sound/death': async.apply(asset.loadSound, 'sound/death.wav'),
      'sound/score': async.apply(asset.loadSound, 'sound/score.wav'),
    }, function (error, results) {
      if (error) {
        console.error(error);
      }

      that.assets = results;
      that.pushScreen(new TitleScreen(that));
    });
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
    while (this.screens.length > 0) {
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
