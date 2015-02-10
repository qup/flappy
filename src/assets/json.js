export function loadJson(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);

  xhr.onerror = function (e) {
    callback(e);
  }

  xhr.onload = function (e) {
    if (this.status == 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        callback(null, data);
      } catch (error) {
        callback(error);
      }
    }
  }

  xhr.send();
}
