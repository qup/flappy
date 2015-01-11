import async from 'async';
import { loadJson } from './json';
import { loadImage } from './image';

export function loadAtlas(path, callback) {
  async.waterfall([
      // first pass, load the json
      async.apply(loadJson, path),

      // second pass, load the image specified in the data
      function (data, callback) {
      async.waterfall([
            // load the image from data
            async.apply(loadImage, data.image),

            // assign the image, and pass data back to the waterfall
            function (image, callback) {
          data.image = image;
          callback(null, data);
            },
         ], callback);
      }
   ], callback);
}
