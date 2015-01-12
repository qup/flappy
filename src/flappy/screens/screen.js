import { EventEmitter } from 'events';

export class Screen extends EventEmitter {
  constructor(game) {
    this.game = game;
  }

  pause() {}

  resume() {}

  dispose() {}

  step(time) {}

  draw(time) {}
}
