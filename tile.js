var TileSheet = (function() {
   var _image;
   var _src;

   var _padding;
   var _margin;
   var _columns;
   var _rows;
   var _complete;

   function TileSheet() {
      this._image = new Image;
      this._padding = 0;
      this._margin = 0;
      this._columns = 0;
      this._rows = 0;
      this._src = '';
      this._complete = true;

      EventDispatcher.call(this);
   }

   // TODO should mixin; rather than inherit.
   TileSheet.prototype = Object.create(EventDispatcher.prototype);
   TileSheet.constructor = TileSheet;

   Object.defineProperty(TileSheet.prototype, "image", {
      get: function () {
         return this._image;
      },
      enumerable: true,
      configurable: true
   });

   Object.defineProperty(TileSheet.prototype, 'src', {
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

            that._padding = data.padding || 0;
            that._margin = data.margin || 0;
            that._columns = data.columns || 0;
            that._rows = data.rows || 0;

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

   Object.defineProperty(TileSheet.prototype, "padding", {
      get: function () {
         return this._padding;
      },
      enumerable: true,
      configurable: true
   });

   Object.defineProperty(TileSheet.prototype, "margin", {
      get: function () {
         return this._margin;
      },
      enumerable: true,
      configurable: true
   });

   Object.defineProperty(TileSheet.prototype, "columns", {
      get: function () {
         return this._columns;
      },
      enumerable: true,
      configurable: true
   });


   Object.defineProperty(TileSheet.prototype, "rows", {
      get: function () {
         return this._rows;
      },
      enumerable: true,
      configurable: true
   });

   Object.defineProperty(TileSheet.prototype, 'complete', {
      get: function () {
         return this._complete;
      },
      enumerable: true,
      configurable: true
   });

   return TileSheet;
})();

(function() {
   CanvasRenderingContext2D.prototype.drawTiles = function(tileSheet, data, columns, x1, y1, x2, y2) {
      var tileWidth = tileSheet.image.width / tileSheet.columns;
      var tileHeight = tileSheet.image.height / tileSheet.rows;

      for (var x = x1; x < x2; x++) {
         for (var y = y1; y < y2; y++) {
            var i = data[(y * columns) + x];
            if (i < 0) {
               continue;
            }

            var sx = (i % (tileSheet.image.width / tileWidth)) * tileWidth;
            var sy = Math.floor(i / (tileSheet.image.width / tileWidth)) * tileHeight;

            this.drawImage(tileSheet.image, sx, sy, tileWidth, tileHeight, (x * tileWidth) - (tileWidth / 2), (y * tileHeight) - tileHeight / 2, tileWidth, tileHeight );
         }
      }
   };
})();
