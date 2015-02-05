import { Screen } from './screen';
import { Play } from './play';
import display from 'display';
import tweens from 'tweens';
import async from 'async';

export class Title extends Screen {
  constructor(game) {
    super(game);

    this.titleOffsetY = 0;
  }

  keyDown(key) {
    this.start();
  }

  activate() {
    async.series([
      async.apply(tweens.setTween, this, { titleOffsetY: -200 }, 0, 'linear'),
      async.apply(tweens.setTween, this, { titleOffsetY: 20 }, 135, 'bounceInOut'),
      async.apply(tweens.setTween, this, { titleOffsetY: 0 }, 135, 'bounceInOut'),
    ]);
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
      display.target.width / 2, this.titleOffsetY + display.target.height / 4, title.width, title.height,
      0, 0, title.width, title.height,
      1, 1, title.width / 2, title.height / 2
    );
  }
}
