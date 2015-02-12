import display from 'display';

export function loadTexture(path, callback) {
  var img = new Image();

  img.onerror = function(e) {
    callback(e);
  };

  img.onload = function(e) {
    var tex = display.createTexture(img.width, img.height);

    var cvs = document.createElement("canvas");
    cvs.width = img.width;
    cvs.height = img.height;

    var ctx = cvs.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    tex.setData(imgData.data);

    img = null;
    callback(null, tex);
  };

  img.src = path;
}
