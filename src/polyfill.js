(function() {
   var lastTime = 0;
   var vendors = ['webkit', 'moz'];
   for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame =
         window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
   }

   if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
         var currTime = new Date().getTime();
         var timeToCall = Math.max(0, 16 - (currTime - lastTime));
         var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                    timeToCall);
                                    lastTime = currTime + timeToCall;
                                    return id;
      };
   }

   if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
         clearTimeout(id);
      };
   }
}());

(function() {

   // XXX Cocoon does not currently expose CanvasRenderingContext2D
   // Workaround, create a canvas and get its constructor.
   if (!window.CanvasRenderingContext2D) {
      window.CanvasRenderingContext2D = document.createElement('canvas').getContext('2d').constructor;
   }

   CanvasRenderingContext2D.prototype.clear =
      CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
      if (preserveTransform) {
         this.save();
         this.setTransform(1, 0, 0, 1, 0, 0);
      }

      this.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (preserveTransform) {
         this.restore();
      }
   };

   CanvasRenderingContext2D.prototype.ellipse =
      CanvasRenderingContext2D.prototype.ellipse || function(x, y, width, height) {
      this.save();
      this.translate(x - width/2, y - height/2);
      this.scale(width, height);
      this.arc(0, 0, 1, 0, 2 * Math.PI, false);
      this.restore();
   };

   CanvasRenderingContext2D.prototype.circle =
      CanvasRenderingContext2D.prototype.circle || function(x, y, radius) {
      this.arc(x, y, radius, 0, 2 * Math.PI, false);
   };
})();
