import { loadJson } from './json';
import { loadImage } from './image';

export function loadAtlas(path, callback) {
  loadJson(path, function(error, atlas) {
    if (error) {
      return callback(error);
    }

    loadImage(atlas.image, function(error, image) {
      if (error) {
        return callback(error);
      }

      atlas.image = image;
      callback(null, atlas);
    });
  });
}
