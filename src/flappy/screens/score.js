import { Screen } from './screen';
import display from 'display';

export class ScoreScreen extends Screen {
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

    this.on('keydown', function (key) {
      this.game.changeScreen(new TitleScreen(this.game));
    });
  }

  step(time) {
    this.playScreen.step(time);
  }

  draw(time) {
    this.playScreen.draw(time);

    display.reset();
    display.drawText('64px munro', 'Game Over', display.target.width / 2, 100, 'white', 'center');

    display.drawText('34px munro', 'Score', display.target.width / 2, 200, 'white', 'center');
    display.drawText('34px munro', `${this.playScreen.score}`, display.target.width / 2, 250, 'white', 'center');

    display.drawText('34px munro', 'Best', display.target.width / 2, 300, 'white', 'center');
    display.drawText('34px munro', `${this.highScore}`, display.target.width / 2, 350, 'white', 'center');
  }
}

import { TitleScreen } from './title';
