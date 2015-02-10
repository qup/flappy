export function loadImage(path, callback) {
  var img = new Image();

  img.onerror = function(e) {
    callback(e);
    console.log('img onerror');
  };

  img.onload = function(e) {
    console.log('img onload');

    callback(null, img);
  };

  img.src = path;
}
