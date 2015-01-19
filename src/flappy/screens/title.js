import { Screen } from './screen';
import { Play } from './play';
import display from 'display';

export class Title extends Screen {
  constructor(game) {
    super(game);
    this.playScreen = new Play(game);

    this.on('keydown', function (key) {
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
