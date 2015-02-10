export class Terrain {
  constructor(columns, rows, size) {
    this.rows = rows;
    this.columns = columns;
    this.size = size;
    this.data = new Array(rows * columns);
    this.fill(0, 0, this.columns, this.rows, -1);
  }

  get bounds() {
    return {
      x: 0,
      y: 0,
      width: this.columns * this.size,
      height: this.rows * this.size,
    };
  }

  generate(i, length, border) {
    while (i < length) {
      var width = Math.floor(Math.random() * (3 - 2 + 1)) + 2;

      while ((i + width) > length) {
        width--;
      }

      var distance = Math.ceil(128 / this.size);
      this.generateObstacle(i, i + width, distance, border);

      var seperation = 3;
      i += width + seperation;
    }
  }

  fill(x, y, width, height, value) {
    for (var col = x; col < width; col++) {
      for (var row = y; row < height; row++) {
        this.data[row * this.columns + col] = value;
      }
    }
  }

  generateObstacle(start, end, distance, border) {
    do {
      var min = Math.floor(Math.random() * this.rows) + border;
      var max = min + (distance + 1);
    } while (max > (this.rows - border));

    for (var col = start;
      (col < end) && (col < this.columns); col++) {
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
          } else if (col == end - 1) {
            // right edge
            value = 10;

            if (row == min) {
              // top right
              value = 6;
            } else if (row == max) {
              // bottom right
              value = 14;
            }
          } else {
            if (row == min) {
              value = 5;
            } else if (row == max) {
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

        this.data[row * this.columns + col] = value;
      }
    }
  }

  queryAt(x, y) {
    var col = Math.floor(x / this.size);
    var row = Math.floor(y / this.size);

    return this.valueAt(col, row);
  }

  valueAt(x, y) {
    return this.data[this.indexAt(x, y)];
  }

  // Returns the index of the given cell coordinates
  indexAt(col, row) {
    return row * this.columns + col;
  }

  intersects(obj) {
    // determine which cell the object is in.
    var col = Math.floor(obj.x / this.size);
    var row = Math.floor(obj.y / this.size);

    // number of data to check.
    var count = 2; // Math.ceil(obj.radius / this.size);

    for (var i = (col - count); i < (col + count); i++) {
      for (var j = (row - count); j < (row + count); j++) {
        if (Math.floor(this.valueAt(i, j)) > 0) {

          // center of the cell in world space.
          var x = i * this.size;
          var y = j * this.size;

          var distance = Math.sqrt((x -= obj.x) * x + (y -= obj.y) * y);

          if (distance < (this.size / 2) + obj.radius) {

            //this.data[this.indexAt(i, j)] = -1;
            return true;
          }
        }
      }
    }
    return false;
  }
}
