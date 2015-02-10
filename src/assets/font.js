import util from 'util';

export function loadFont(path, callback) {
  var style = document.createElement('style');
  style.innerHTML = '@font-face { font-family: "munro"; src: url("font/munro.ttf"); }';
  document.head.appendChild(style);

  callback(null, 'munro');
}
