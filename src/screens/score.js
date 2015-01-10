import { Screen } from './screen';

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

      this.on('keydown', function(key) {
         this.game.changeScreen(new TitleScreen(this.game));
      });
   }

   step(time) {
      this.playScreen.step(time);
   }
   
   draw(time) {
      var context = this.game.canvas.getContext('2d');

      this.playScreen.draw(time);

      context.setTransform(1, 0, 0, 1, 0, 0);

      this.elapsedTime += time;
      context.globalAlpha = Math.min(0.4, this.elapsedTime / 2);
      context.fillStyle = 'black';
      context.rect(0, 0, context.canvas.width, context.canvas.height);
      context.fill();

      context.globalAlpha = 1.0;

      context.textAlign = 'center';
      context.fillStyle = 'white';
      context.font = '64px munro';
      context.fillText('Game Over!', context.canvas.width / 2, 100);

      context.font = '34px munro';
      context.fillText('Score', context.canvas.width / 2, 200);

      context.fillText(this.playScreen.score.toString(), context.canvas.width / 2, 245 );

      context.fillText('Best', context.canvas.width / 2, 300);
      context.fillText(this.highScore.toString(), context.canvas.width / 2, 345);
   }   
}

import { GameTitleScreen } from './title';
