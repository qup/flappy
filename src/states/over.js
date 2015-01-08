import { GameState } from './state';
import { GameTitleState } from './title';

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
   }

   handleEvent(event) {
     switch(event.type) {
         case 'keydown':
            if (event.keyCode == 32) {
               this.game.changeState(new GameTitleState(this.game));
               break;
            }
         break;

         case 'mousedown':
            this.game.changeState(new GameTitleState(this.game));
         break;

         case 'touchstart':
            this.game.changeState(new GameTitleState(this.game));
         break;
      }
   }
   
   step(time) {
      this.playState.step(time);
   }
   
   draw(time) {
      var context = this.game.canvas.getContext('2d');

      this.playState.draw(time);

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

      context.fillText(this.playState.score.toString(), context.canvas.width / 2, 245 );

      context.fillText('Best', context.canvas.width / 2, 300);
      context.fillText(this.highScore.toString(), context.canvas.width / 2, 345);
   }   
}
