import screens from './screens';
import window from 'window';
import async from 'async';
import assets from './assets';

export class Game {
  constructor(element) {
    this.screens = new Array();

    const events = [
      'keydown',
      'keyup',
      'keypress',
      'mousedown',
      'mouseup',
      'mousepress',
      'touchstart',
      'touchend',
      'touchmove',
      'blur',
      'focus',
    ];

    events.forEach((event) => {
      window.on(event, (...args) => {
        this.delegate(event, args);
      });
    });

    var tick = this.tick.bind(this);
    window.requestRedraw(tick);

    this.assets = new Object();
    this.preload();
  }

  preload() {
    var that = this;
    var tasks = async.parallel({
      'tilesheet/tiles': async.apply(assets.loadAtlas, 'tilesheet/tiles.json'),
      'spritesheet/sprite': async.apply(assets.loadAtlas, 'spritesheet/sprite.json'),
      'image/background': async.apply(assets.loadImage, 'image/background.png'),
      'sound/flap': async.apply(assets.loadSound, 'sound/flap.wav'),
      'sound/death': async.apply(assets.loadSound, 'sound/death.wav'),
      'sound/score': async.apply(assets.loadSound, 'sound/score.wav'),
    }, function (error, results) {
      if (error) {
        console.error(error);
      }

      that.assets = results;
      that.pushScreen(new screens.Title(that));
    });
  }

  pushScreen(screen) {
    this.screens.push(screen);
  }

  popScreen() {
    if (this.screens.length > 0) {
      this.screens[this.screens.length - 1].deactivate();
      var screen = this.screens.pop();

      if (this.screens.length > 0) {
        this.screens[this.screens.length - 1].activate();
      }

      return screen;
    }
  }

  changeScreen(screen) {
    while (this.screens.length > 0) {
      this.screens[this.screens.length - 1].deactivate();
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
      window.requestRedraw(this.tick.bind(this));
    } else {
      global.window.setTimeout(this.tick.bind(this), 500);
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
