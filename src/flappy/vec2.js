export var Vec2 = (function () {
  function Vec2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Vec2.prototype.clone = function () {
    return new Vec2(this.x, this.y);
  }

  Vec2.prototype.normalize = function () {
    var l = this.length();
    this.x = this.x / l;
    this.y = this.y / l;
    return this;
  }

  Vec2.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  Vec2.add = function (v1, v2) {
    return new vec2(v1.x + v2.x, v1.y + v2.y);
  }
  Vec2.mul = function (scalar, v2) {
    return new vec2(scalar * v2.x, scalar * v2.y);
  }
  Vec2.sub = function (v1, v2) {
    return new vec2(v1.x - v2.x, v1.y - v2.y);
  }
  Vec2.dot = function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  return Vec2;
})();
