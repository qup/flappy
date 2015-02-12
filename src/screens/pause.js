import { Screen } from './screen';
import display from 'display';
import async from 'async';
import tweens from 'tweens';

export class Pause extends Screen {
  constructor(game, playScreen) {
    super(game);

    this.playScreen = playScreen;
    this.elapsedTime = 0;

    this.titleScale = 1;
  }

  resume() {
    async.series([
      async.apply(tweens.setTween, this, { titleScale: 1 }, 0, 'linear'),
      async.apply(tweens.setTween, this, { titleScale: 0 }, 150, 'bounceInOut'),
    ], (error) => {
      this.game.pop();
    });
  }

  keyDown() {
    this.resume();
  }

  activate() {
    async.series([
      async.apply(tweens.setTween, this, { titleScale: 0 }, 0, 'linear'),
      async.apply(tweens.setTween, this, { titleScale: 1 }, 150, 'bounceInOut'),
    ]);
  }

  draw(time) {
    this.playScreen.draw(time);

    var tex = this.game.assets['texture/pause'];
    let viewport = [0, 0, window.innerWidth, window.innerHeight];

    let width = tex.width * this.titleScale;
    let height = tex.height * this.titleScale;

    let x = (viewport[2] / 2) - (width / 2);
    let y = 200 - (height / 2);

    display.drawImage(tex, x, y, width, height);
  }
}
