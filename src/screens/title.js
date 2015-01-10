import { Screen } from './screen';
import { PlayScreen } from './play';

export class TitleScreen extends Screen {
   constructor(game) {
      super(game);
      this.playState = new PlayScreen(game);

      this.on('keydown', function(key) {
         this.game.changeScreen(this.playState);
      });
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
