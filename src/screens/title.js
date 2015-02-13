import { Screen } from './screen';
import { Play } from './play';
import display from 'display';
import tweens from 'tweens';
import async from 'async';

export class Title extends Screen {
  constructor(game) {
    super(game);

    this.titleOffsetX = 0;
    this.titleOffsetY = 0;
  }

  touchStart(touches) {
    this.start();
  }

  keyDown(key) {
    this.start();
  }

  activate() {
    async.series([
      async.apply(tweens.setTween, this, { titleOffsetY: -200 }, 0, 'linear'),
      async.apply(tweens.setTween, this, { titleOffsetY: 20 }, 135, 'bounceInOut'),
      async.apply(tweens.setTween, this, { titleOffsetY: 0 }, 135, 'bounceInOut'),
    ]);
  }

  start() {
    this.game.change(new Play(this.game));
  }

  draw(time) {
    display.clear([0.5, 0.5, 0.5, 1.0]);

    var tex = this.game.assets['texture/title'];
    let viewport = [0, 0, window.innerWidth, window.innerHeight];

    let width = tex.width;
    let height = tex.height;
    let x = this.titleOffsetX + (viewport[2] / 2) - (width / 2);

    let y = this.titleOffsetY + 200;
    display.drawImage(tex, x, y, width, height);
  }
}
