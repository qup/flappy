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
}

var current = new Context();
export default current;
