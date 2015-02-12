import { EventEmitter } from 'events';
import { Bird } from './bird';
import { Terrain } from './terrain';

export class World extends EventEmitter {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.accumulator = 0;

    this.score = 0;
    var size = 64;
    var columns = Math.round(width / size) * 4;
    var rows = Math.round(height / size) + 1;

    this.terrain = new Terrain(columns, rows, size);
    this.terrainBorder = Math.floor((rows - 6) / 2);
    this.terrain.fill(0, 0, columns, rows, - 1);
    this.terrain.fill(0, 0, columns, this.terrainBorder - 1, 2);
    this.terrain.fill(0, this.terrainBorder - 1, columns, this.terrainBorder, 1);
    this.generationIndex = 0;

    this.bird = new Bird(width - 300, height / 2, 16, 1.31);
  }

  step(time) {
    var dt = 1 / 120;
    this.accumulator += time;

    while (this.accumulator >= dt) {
      this.accumulator -= dt;
      this.integrate(dt);
    }
  }

  integrate(time) {
    var width = Math.round(this.width / this.terrain.size);
    var views = Math.floor(this.terrain.columns / width);

    var column = Math.round((this.bird.x + this.width) / this.terrain.size);
    var index = (Math.floor(column / width)) % views;

    if (index != this.generationIndex) {
      var start = Math.floor(index * width);

      this.terrain.fill(start, 0, start + width, this.terrain.rows, -1);
      this.terrain.fill(start, 0, start + width, this.terrainBorder - 1, 2);
      this.terrain.fill(start, this.terrainBorder - 1, start + width, this.terrainBorder, 1);
      this.terrain.generate(start + 3, start + width, this.terrainBorder);

      this.generationIndex = index;
    }

    if (this.bird.position.x > (this.terrain.columns * this.terrain.size)) {
      this.bird.position.x -= this.bird.position.x;
      console.info('Transporting player');
    }

    if (this.bird.y > this.height - (this.bird.radius * 2)) {
      this.bird.velocity.y = -100;
    }

    this.bird.step(time);

    var block = this.terrain.queryAt(this.bird.x, this.bird.y);
    if (block == 0) {
      this.canScore = true;
    } else if (block == -1 && this.canScore) {
      this.score++;
      this.canScore = false;
      this.emit('score');
    }

    if (!this.bird.dead) {
      if (this.terrain.intersects(this.bird)) {
        this.bird.die();
        this.emit('defeat');
      }
    }
  }
}
