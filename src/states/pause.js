import { GameState } from './state';
import display from '../display';
export class GamePauseState extends GameState {
   constructor(game, playState) {
      super(game);
      
      this.playState = playState;
      this.elapsedTime = 0;
      
      this.on('focus', function() {
         this.game.popState();
      });
   }

   draw(time) {
      this.playState.draw(time);

      display.reset();
      display.drawText('64px munro', 'Pause', display.target.width / 2, display.target.height / 2 - 100, 'white', 'center');
   }
}
