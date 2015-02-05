import { Screen } from './screen';
import display from 'display';
import async from 'async';
import tweens from 'tweens';

export class Pause extends Screen {
  constructor(game, playScreen) {
    super(game);

    this.playScreen = playScreen;
    this.elapsedTime = 0;

    this.textScale = 1;
  }

  resume() {
    async.series([
      async.apply(tweens.setTween, this, { textScale: 1 }, 0, 'linear'),
      async.apply(tweens.setTween, this, { textScale: 0 }, 150, 'bounceInOut'),
    ], (error) => {
      this.game.pop();
    });
  }

  focus() {
    this.resume();
  }

  activate() {
    async.series([
      async.apply(tweens.setTween, this, { textScale: 0 }, 0, 'linear'),
      async.apply(tweens.setTween, this, { textScale: 1 }, 150, 'bounceInOut'),
    ]);
  }

  draw(time) {
    this.playScreen.draw(time);

    display.reset();

    display.drawText(`${this.textScale * 90}px munro`, 'Pause', display.target.width / 2, display.target.height / 2 - 100, 'white', 'center');
  }
}
