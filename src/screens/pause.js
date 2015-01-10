import { Screen } from './screen';

export class PauseScreen extends Screen {
   constructor(game, playState) {
      super(game);
      
      this.playState = playState;
      this.elapsedTime = 0;
      
      this.on('focus', function() {
         this.game.popState();
      });
   }
   
   draw(time) {
      var context = this.game.canvas.getContext('2d');
      var elapsedTime = window.performance.now() / 1000;

      this.playState.draw(time);

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.fillStyle = 'white';
      context.textAlign = 'center';

      context.font = '64px munro';
      context.fillText('Pause', context.canvas.width / 2, context.canvas.height / 2 - 100);
   }
}
