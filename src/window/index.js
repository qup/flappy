import { EventEmitter } from 'events';

export class Window extends EventEmitter {
   constructor() {
      if (current) {
         throw new TypeError('Illegal constructor');
      }

      super();

      var target = this;
      ['keydown', 'keyup', 'keypress'].forEach(function(event) {
         global.window.addEventListener(event, function(data) {
            target.emit(event);
         });
      });
  
      ['mousedown', 'mouseup', 'mousepress'].forEach(function(event) {
         global.window.addEventListener(event, function(data) {
            target.emit(event);
         });
      });

      ['touchstart', 'touchend', 'touchmove'].forEach(function(event) {
         global.window.addEventListener(event, function(data) {
            target.emit(event);
         });
      });
            
      ['blur', 'focus', 'focusin', 'focusout'].forEach(function(event) {
         global.window.addEventListener(event, function(data) {
            target.emit(event); 
         });
      });
   }
    
   requestRedraw(callback) {
      return global.window.requestAnimationFrame(callback);
   }
   
   cancelRedraw(requestId) {
      return global.window.cancelAnimationFrame(requestId);
   }

   get focused() {
      return global.window.document.hasFocus;
   }
}

var current = new Window();
export default current;
