import { GameState } from './state';
import { GamePlayState } from './play';
import display from '../display';

export class GameTitleState extends GameState {
   constructor(game) {
      super(game);
      this.playState = new GamePlayState(game);
      
      this.on('keydown', function(key) {
         this.game.changeState(this.playState);
      });
   }

   draw(time) {
      // Draw the play state.
      this.playState.draw(time);

      // Draw our title overlay.
      display.reset();
      display.drawText('100px munro', 'flappy', display.target.width / 2, 100, 'white');
      display.drawText('24px munro', 'tap to play', display.target.width / 2, 150, 'white');
   }
}
