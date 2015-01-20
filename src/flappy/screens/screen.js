import { EventEmitter } from 'events';

export class Screen extends EventEmitter {
  constructor(game) {
    this.game = game;
  }

  activate() {}

  deactivate() {}

  step(time) {}

  draw(time) {}
}
