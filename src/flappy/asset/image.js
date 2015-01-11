export function loadImage(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.responseType = 'blob';

  xhr.onerror = function (e) {
    callback(e);
  }

  xhr.onload = function (e) {
    if (this.status == 200) {
      var blob = this.response;

      var img = document.createElement('img');
      img.onload = function (e) {
        window.URL.revokeObjectURL(img.src);
        callback(null, img);
      };

      img.src = window.URL.createObjectURL(blob);
    }
  }

  xhr.send();
}
