export class Context {
  constructor() {
    // For now, only allow a single context.
    if (current) {
      throw TypeError('Illegal constructor');
    }

    var document = global.document;
    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    setTimeout(function () {
      document.body.appendChild(canvas);
    }, 100);

    this.target = canvas;
  }

  clear() {
    var context = this.target.getContext('2d');
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  reset() {
    var context = this.target.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawText(font, text, x, y, color, align) {
    var context = this.target.getContext('2d');

    context.font = font;
    context.textAlign = align;
    context.fillStyle = color;
    context.fillText(text, x, y);
  }

  drawImage(image, x, y, width, height, srcX, srcY, srcWidth, srcHeight, scaleX = 1, scaleY = 1, originX = 0, originY = 0) {
    var context = this.target.getContext('2d');

    context.imageSmoothingEnabled = false;

    x = (x * scaleX) + (-originX * scaleX);
    y = (y * scaleY) + (-originY * scaleY);

    width = width * scaleX;
    height = height * scaleY;

    context.drawImage(image, srcX, srcY, srcWidth, srcHeight, x, y, width, height);
  }
}

var current = new Context();
export default current;
