import screens from './screens';
import window from 'window';
import async from 'async';
import assets from './assets';

export class Game {
  constructor(element) {
    this._screens = new Array();

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
      that.push(new screens.Title(that));
    });
  }

  push(screen) {
    var stack = this._screens;

    var current = stack[stack.length - 1];
    if (current) {
      current.deactivate();
    }

    screen.activate();
    stack.push(screen);
  }

  pop() {
    var stack = this._screens;

    var current = stack.pop();
    if (current) {
      current.deactivate();
    }

    var previous = stack[stack.length - 1];
    if (previous) {
      previous.activate();
    }

    return current;
  }

  peek() {
    var stack = this._screens;
  }

  switch(screen) {
    var stack = this._screens;

    while (stack.length) {
      var current = stack[stack.length - 1];
      current.deactivate();
      stack.pop();
    }

    screen.activate();
    stack.push(screen);
  }

  delegate(event, ...args) {
    var stack = this._screens;
    var current = stack[stack.length - 1];

    if (current) {
      if (current[event]) {
        current[event](...args);
      }

      current.emit(event, ...args);
    }
  }

  draw(time) {
    this.delegate('draw', time);
  }

  step(time) {
    this.delegate('step', time);
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
