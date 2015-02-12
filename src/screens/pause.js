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

    display.drawText(
      'munro', this.textScale * 90, 'Pause',
      (window.innerWidth / 2) - (display.measureText('munro', this.textScale * 90, 'Pause').width / 2),
      window.innerHeight / 2 - 100, [1, 1, 1, 1]
    );
  }
}
