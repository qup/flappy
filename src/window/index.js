import { EventEmitter } from 'events';

export class Window extends EventEmitter {
  constructor() {
    if (current) {
      throw new TypeError('Illegal constructor');
    }

    super();

    var target = this;
    ['keydown', 'keyup', 'keypress'].forEach(function (event) {
      global.window.addEventListener(event, function (data) {
        var key = data.key || data.which;
        var scancode = data.location;

        var modifiers = {
          alt: data.altKey,
          ctrl: data.ctrlKey,
          shift: data.shiftKey,
          meta: data.metaKey,
        };

        target.emit(event, key, scancode, modifiers);
      });
    });

    ['mousedown', 'mouseup', 'mousepress'].forEach(function (event) {
      global.window.addEventListener(event, function (data) {
        var button = data.button;
        var x = data.clientX;
        var y = data.clientY;
        var modifiers = {
          alt: data.altKey,
          ctrl: data.ctrlKey,
          shift: data.shiftKey,
          meta: data.metaKey,
        };

        target.emit(event, x, y, button, modifiers);
      });
    });

    ['touchstart', 'touchend', 'touchmove'].forEach(function (event) {
      global.window.addEventListener(event, function (data) {
        target.emit(event);
      });
    });

    ['blur', 'focus', 'focusin', 'focusout'].forEach(function (event) {
      global.window.addEventListener(event, function (data) {
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
