import mantle from 'mantle';
import flappy from './';

mantle.on('load', function() {
  var game = new flappy.Game();
  game.start(mantle);
});
