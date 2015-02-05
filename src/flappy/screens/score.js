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

    this.elapsedTime = 0;

    this.on('keyDown', function (key) {
      this.game.switch(new Title(this.game));
    });

    this.scoreOffsetY = 0;
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

    display.reset();
    display.drawText('64px munro', 'Game Over', display.target.width / 2, 100 + this.scoreOffsetY, 'white', 'center');

    display.drawText('34px munro', 'Score', display.target.width / 2, 200 + this.scoreOffsetY, 'white', 'center');
    display.drawText('34px munro', `${this.playScreen.score}`, display.target.width / 2, 250 + this.scoreOffsetY, 'white', 'center');

    display.drawText('34px munro', 'Best', display.target.width / 2, 300 + this.scoreOffsetY, 'white', 'center');
    display.drawText('34px munro', `${this.highScore}`, display.target.width / 2, 350 + this.scoreOffsetY, 'white', 'center');
  }
}

import { Title } from './title';
