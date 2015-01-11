export class Bird {
  constructor(x, y, radius, mass) {
    this.position = { x: x, y: y };
    this.velocity = { x: 0, y: 0 };
    this.radius = radius;
    this.mass = mass;
    this.dead = false;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  step(time) {
    var gravity = -980;

    // apply forces.
    this.velocity.y += (gravity * this.mass) * time;

    // terminal velocity:
    var max = 1500;
    if (this.velocity.y < -max) {
      this.velocity.y = -max;
    }

    this.position.x += this.velocity.x * time;
    this.position.y += this.velocity.y * time;
  }

  flap() {
    if (this.dead) {
      return;
    }

    this.velocity.y = 460;
    this.velocity.x = 190;
  }

  die() {
    if (this.dead) {
      return;
    }

    this.dead = true;
    this.velocity.x = 0;
    this.velocity.y = 250;
  }
}
