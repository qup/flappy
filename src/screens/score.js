import { Screen } from './screen';
import display from 'display';

import async from 'async';
import tweens from 'tweens';

export class Score extends Screen {
  constructor(game, playScreen) {
    super(game, playScreen);

    this.playScreen = playScreen;

    this.highScore = window.localStorage.getItem('highscore') || 0;
    if (this.highScore < this.playScreen.score) {
      this.highScore = this.playScreen.score;
      window.localStorage.setItem('highscore', this.highScore);
    }

    console.info('Submitting score');
    this.game.submitScore('score', this.playScreen.score);

    this.scoreOffsetY = 0;
  }

  keyDown() {
    this.game.change(new Title(this.game));
  }

  activate() {
    async.series([
      async.apply(tweens.setTween, this, { scoreOffsetY: -200 }, 0, 'linear'),
      async.apply(tweens.setTween, this, { scoreOffsetY: 20 }, 135, 'bounceInOut'),
      async.apply(tweens.setTween, this, { scoreOffsetY: 0 }, 135, 'bounceInOut'),
    ]);
  }

  step(time) {
    this.playScreen.step(time);
  }

  draw(time) {
    this.playScreen.draw(time);

    display.drawText('munro', 64,'Game Over',
      window.innerWidth / 2 - display.measureText('munro', 64, 'Game Over').width / 2,
      100 + this.scoreOffsetY, [1, 1, 1, 1]
    );
  }
}

import { Title } from './title';
