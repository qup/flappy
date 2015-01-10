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

      setTimeout(function() {
         document.body.appendChild(canvas);
      }, 100);

      this.target = canvas;
   }

   drawText(font, text, x, y, color) {
      var context = this.target.getContext('2d');

      context.font = font;
      context.fillStyle = color;
      context.fillText(text, x, y);
   }
   
   drawImage(image, x, y, width, height, srcX, srcY, srcWidth, srcHeight) {
      var context = this.target.getContext('2d');

      context.drawImage(image, srcX, srcY, srcWidth, srcHeight, x, y, width, height);
   }
}

var current = new Context();
export default current;
