import { GameState } from './state';
import display from '../display';

export class GameOverState extends GameState {
   constructor(game, playState) {
      super(game, playState);

      this.playState = playState;

      this.highScore = window.localStorage.getItem('highscore') || 0;
      if (this.highScore < this.playState.score) {
         this.highScore = this.playState.score;
         window.localStorage.setItem('highscore', this.highScore);
      }

      console.info('Submitting score');
      this.game.submitScore('score', this.playState.score);

      this.elapsedTime = 0;

      this.on('keydown', function(key) {
         this.game.changeState(new GameTitleState(this.game));
      });
   }

   step(time) {
      this.playState.step(time);
   }
   
   draw(time) {
      this.playState.draw(time);

      display.reset();
      display.drawText('64px munro', 'Game Over', display.target.width / 2, 100, 'white', 'center');
      
      display.drawText('34px munro', 'Score', display.target.width / 2, 200, 'white', 'center');
      display.drawText('34px munro', `${this.playState.score}`, display.target.width / 2, 250, 'white', 'center');
      
      display.drawText('34px munro', 'Best', display.target.width / 2, 300, 'white', 'center');
      display.drawText('34px munro', `${this.highScore}`, display.target.width / 2, 350, 'white', 'center');
   }
}

import { GameTitleState } from './title';
