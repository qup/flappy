import { Screen } from './screen';
import { Play } from './play';
import display from 'display';

export class Title extends Screen {
  constructor(game) {
    super(game);
  }

  keyDown(key) {
    this.start();
  }

  start() {
    this.game.switch(new Play(this.game));
  }

  draw(time) {
    var background = this.game.assets['image/background'];
    display.drawImage(
      background,
      0, 0, display.target.width, display.target.height,
      0, 0, background.width, background.height,
      1, 1, 0, 0
    );

    var title = this.game.assets['image/title'];
    display.drawImage(
      title,
      display.target.width / 2, display.target.height / 4, title.width, title.height,
      0, 0, title.width, title.height,
      1, 1, title.width / 2, title.height / 2
    );
  }
}
