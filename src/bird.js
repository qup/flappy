var Bird = (function() {
   var position;
   var velocity;
   var radius;
   var dead;
   var mass;

   function Bird(x, y, radius) {
      this.position = new Vec2(x, y);
      this.velocity = new Vec2(0, 0);
      this.radius = radius;
      this.dead = false;
      this.mass = 1.32;
   }

   Object.defineProperty(Bird.prototype, 'x', {
      get: function () {
         return this.position.x;
      },
      enumerable: true,
      configurable: true
   });

   Object.defineProperty(Bird.prototype, 'y', {
      get: function () {
         return this.position.y;
      },
      enumerable: true,
      configurable: true
   });

   Bird.prototype.step = function(dt) {
      var gravity = -980;

      // apply forces.
      this.velocity.y += (gravity * this.mass) * dt;

      // terminal velocity:
      var max = 1500;
      if (this.velocity.y < -max) {
         this.velocity.y = -max;
      }

      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
   };

   Bird.prototype.flap = function() {
      // Dead birds don't flap.
      if (this.dead) {
         return;
      }

      this.velocity.y = 460;
      this.velocity.x = 190;
   };

   Bird.prototype.die = function() {
      if (this.dead) {
         return;
      }

      this.dead = true;
      this.velocity.x = 0;
      this.velocity.y = 250;
   };

   return Bird;
})();

