import { Howl } from 'howler';

export function loadSound(path, callback) {
  var audio = new Howl({
    urls: [path],
    onload: function () {
      callback(null, this);
    },

    onloaderror: function (error) {
      callback(error);
    },
  });
}
