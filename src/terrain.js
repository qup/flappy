export var Terrain = (function() {
   var rows, columns;
   var cells;
   var cellSize;

   function Terrain(columns, rows, cellSize) {
      this.rows = rows;
      this.columns = columns;
      this.cellSize = cellSize;
      this.cells = new Array(rows * columns);
      this.fill(0, 0, this.columns, this.rows, -1);
   }

   Terrain.prototype.generate = function(i, length, border) {
      while(i < length) {
         var width = Math.floor(Math.random() * (3 - 2 + 1)) + 2;

         while ((i + width) > length) {
            width--;
         }

         var distance = Math.ceil(128 / this.cellSize);
         this.generateObstacle(i, i + width, distance, border);
         
         seperation = 3;
         i += width + seperation;
      }
   }

   Terrain.prototype.fill = function(x, y, width, height, value) {
      for (var col = x; col < width; col++) {
         for (var row = y; row < height; row++) {
            this.cells[row * this.columns + col] = value;
         }
      }
   };

   Terrain.prototype.generateObstacle = function(start, end, distance, border) {
      do {
         var min = Math.floor(Math.random() * this.rows) + border;
         var max = min + (distance + 1);
      } while(max > (this.rows - border));

      for (var col = start; (col < end) && (col < this.columns); col++) {
         for (var row = 0; row < this.rows; row++) {
            var value;
            var width = start - end;

            // if it falls within the gap distance, it is an 'air' cell.
            if (row > min && row < max) {
               value = 0;
            } else {
               // otherwise, it is some sort of solid tile, determine which.
               // default to center block.
               value = 9;

               // check for edges
               if (col == start) {
                  // left edge
                  value = 8;

                  if (row == min) {
                     // top left
                     value = 4;
                  } else if (row == max) {
                     // bottom left
                     value = 12;
                  }
               } else if(col == end - 1) {
                  // right edge
                  value = 10;

                  if (row == min) {
                     // top right
                     value = 6;
                  } else if(row == max) {
                     // bottom right
                     value = 14;
                  }
               } else {
                  if (row == min) {
                     value = 5;
                  } else if(row == max) {
                     // center bottom
                     value = 13;
                  }
               }

               // special case; single width columns.
               if ((end - start) == 1) {
                  if (row == min) {
                     value = 7;
                  } else if (row == max) {
                     value = 15;
                  } else {
                     value = 11;
                  }
               }
            }

            this.cells[row * this.columns + col] = value;
         }
      }
   };

   // Returns the value at the given world coordiantes.
   //
   Terrain.prototype.queryAt = function(x, y) {
      var col = Math.floor(x / this.cellSize);
      var row = Math.floor(y / this.cellSize);

      return this.valueAt(col, row);
   }

   // Returns the value at the given cell coordinates.
   Terrain.prototype.valueAt = function(x, y) {
      return this.cells[this.indexAt(x, y)];
   };

   // Returns the index of the given cell coordinates
   Terrain.prototype.indexAt = function(col, row) {
      return row * this.columns + col;
   };

   Terrain.prototype.intersects = function(obj) {
      // determine which cell the object is in.
      var col = Math.floor(obj.x / this.cellSize);
      var row = Math.floor(obj.y / this.cellSize);

      // number of cells to check.
      var count = 2; // Math.ceil(obj.radius / this.cellSize);

      for (var i = (col - count); i < (col + count); i++) {
         for (var j = (row - count); j < (row + count); j++) {
            if (Math.floor(this.valueAt(i, j)) > 0) {

               // center of the cell in world space.
               var x = i * this.cellSize;
               var y = j * this.cellSize;

               var distance = Math.sqrt((x -= obj.x) * x + (y -= obj.y) * y);

               if (distance < (this.cellSize / 2) + obj.radius) {

                  //this.cells[this.indexAt(i, j)] = -1;
                  return true;
               }
            }
         }
      }

      return false;
   };

   return Terrain;
})();
