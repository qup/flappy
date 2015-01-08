import { GameState } from './state';
import { GamePlayState } from './play';

export class GameTitleState extends GameState {
   constructor(game) {
      super(game);
      this.playState = new GamePlayState(game);
   }

   handleEvent(event) {
    switch(event.type) {
         case 'keydown':
            if (event.keyCode == 32) {
               this.game.changeState(this.playState);
               break;
            }
         break;

         case 'mousedown':
            if (event.button == 0) {
               this.game.changeState(this.playState);
               break;
            }
         break;

         case 'touchstart':
            this.game.changeState(this.playState);
         break;
      }
   }
   
   draw(time) {
    var context = this.game.canvas.getContext('2d');

      // Draw the play state.
      this.playState.draw(time);

      // Draw our title overlay.
      context.setTransform(1, 0, 0, 1, 0, 0);

      context.textAlign = 'center';
      context.font = '90px munro';
      context.fillStyle = 'white';
      context.fillText('flappy', context.canvas.width / 2, 100 );

      context.textAlign = 'center';
      context.font = '24px munro';
      context.fillStyle = 'white';
      context.fillText('tap to play', context.canvas.width / 2, 150);
   }
}
