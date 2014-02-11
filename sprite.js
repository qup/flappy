var SpriteSheet = (function () {
   var _image;
   var _frames;
   var _animations;
   var _src;
   var _complete;

   function SpriteSheet() {
      this._image = new Image();
      this._frames = [];
      this._animations = [];
      this._src = '';
      this._complete = true;

      EventDispatcher.call(this);
   }

   // TODO should mixin; rather than inherit.
   SpriteSheet.prototype = Object.create(EventDispatcher.prototype);
   SpriteSheet.constructor = SpriteSheet;

   Object.defineProperty(SpriteSheet.prototype, 'image', {
      get: function () {
         return this._image;
      },
      enumerable: true,
      configurable: true
   });

   Object.defineProperty(SpriteSheet.prototype, 'src', {
      get: function () {
         return this._src;
      },

      set: function (value) {
         this._complete = false;

         var request = new XMLHttpRequest();
         request.open('GET', value, true);
         request.send();

         var that = this;
         request.addEventListener('load', function (event) {
            var data = JSON.parse(request.responseText);

            that._frames = data.frames;
            that._animations = data.animations;

            that._image = new Image;
            that._image.addEventListener('load', function (e) {
               that._complete = true;
               that.dispatchEvent(e);
            });

            that._image.src = data.image;
         });

         this._src = value;
      },
      enumerable: true,
      configurable: true
   });

   Object.defineProperty(SpriteSheet.prototype, 'frames', {
      get: function () {
         return this._frames;
      },
      enumerable: true,
      configurable: true
   });

   Object.defineProperty(SpriteSheet.prototype, 'animations', {
      get: function () {
         return this._animations;
      },
      enumerable: true,
      configurable: true
   });

   return SpriteSheet;
})();

(function() {
   CanvasRenderingContext2D.prototype.drawSprite = function(spriteSheet, index, dx, dy, dw, dh) {
      var frame = spriteSheet.frames[index];

      var sx = frame.left;
      var sy = frame.top;
      var sw = frame.right - frame.left;
      var sh = frame.bottom - frame.top;

      dx -= dw / 2;
      dy -= dh / 2;

      this.drawImage(spriteSheet.image, sx, sy, sw, sh, dx, dy, dw, dh);
   };
})();
