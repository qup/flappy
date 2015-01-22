import { EventEmitter } from 'events';

export class Window extends EventEmitter {
  constructor() {
    if (current) {
      throw new TypeError('Illegal constructor');
    }

    super();

    ['keydown', 'keyup', 'keypress'].forEach(event => {
      global.window.addEventListener(event, data => {
        var key = data.key || data.which;
        var scancode = data.location;

        var modifiers = {
          alt: data.altKey,
          ctrl: data.ctrlKey,
          shift: data.shiftKey,
          meta: data.metaKey,
        };

        this.emit(event, key, scancode, modifiers);
      });
    });

    ['mousedown', 'mouseup', 'mousepress'].forEach(event => {
      global.window.addEventListener(event, data => {
        var button = data.button;
        var x = data.clientX;
        var y = data.clientY;
        var modifiers = {
          alt: data.altKey,
          ctrl: data.ctrlKey,
          shift: data.shiftKey,
          meta: data.metaKey,
        };

        this.emit(event, x, y, button, modifiers);
      });
    });

    ['touchstart', 'touchend', 'touchmove'].forEach(event => {
      global.window.addEventListener(event, data => {
        this.emit(event);
      });
    });

    ['blur', 'focus', 'focusin', 'focusout'].forEach(event => {
      global.window.addEventListener(event, data => {
        this.emit(event);
      });
    });
  }

  requestRedraw(callback) {
    return global.window.requestAnimationFrame(callback);
  }

  cancelRedraw(requestId) {
    return global.window.cancelAnimationFrame(requestId);
  }

  requestFullscreen() {
    return global.window.requestFullscreen();
  }

  cancelFullscreen() {
    return global.window.cancelFullscreen();
  }

  get title() {
    return global.window.document.title;
  }

  set title(value) {
    global.window.document.title = value;
  }

  get focused() {
    return global.window.document.hasFocus;
  }
}

var current = new Window();
export default current;
