import { Screen } from './screen';
import { PlayScreen } from './play';
import display from '../../display';

export class TitleScreen extends Screen {
   constructor(game) {
      super(game);
      this.playScreen = new PlayScreen(game);

      this.on('keydown', function(key) {
         this.game.changeScreen(this.playScreen);
      });
   }

   draw(time) {
      // Draw the play state.
      this.playScreen.draw(time);

      // Draw our title overlay.
      display.reset();
      display.drawText('100px munro', 'flappy', display.target.width / 2, 100, 'white', 'center');
      display.drawText('24px munro', 'tap to play', display.target.width / 2, 150, 'white', 'center');
   }
}
