import { loadJson } from './json';
import { loadTexture } from './texture';

export function loadAtlas(path, callback) {
  loadJson(path, function(error, atlas) {
    if (error) {
      return callback(error);
    }

    loadTexture(atlas.image, function(error, texture) {
      if (error) {
        return callback(error);
      }

      atlas.texture = texture;
      callback(null, atlas);
    });
  });
}
