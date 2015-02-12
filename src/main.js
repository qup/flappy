import mantle from 'mantle';
import display from 'display';
import flappy from './';

mantle.on('load', function() {
  display.bind({
    antialias: false,
  });

  var game = new flappy.Game();
  game.start(mantle);
});
