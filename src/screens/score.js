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
    this.scoreOffsetX = 0;
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

    var tex = this.game.assets['texture/game-over'];
    let viewport = [0, 0, window.innerWidth, window.innerHeight];

    let width = tex.width;
    let height = tex.height;
    let x = this.scoreOffsetX + (viewport[2] / 2) - (width / 2);
    let y = this.scoreOffsetY + 200;

    display.drawImage(tex, x, y, width, height);
  }
}

import { Title } from './title';
