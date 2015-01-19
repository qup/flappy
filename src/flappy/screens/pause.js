import { Screen } from './screen';

export class Pause extends Screen {
  constructor(game, playScreen) {
    super(game);

    this.playScreen = playScreen;
    this.elapsedTime = 0;

    this.on('focus', function () {
      this.game.popScreen();
    });
  }

  draw(time) {
    this.playScreen.draw(time);

    display.reset();
    display.drawText('64px munro', 'Pause', display.target.width / 2, display.target.height / 2 - 100, 'white', 'center');
  }
}
