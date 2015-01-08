import { EventEmitter } from 'events';

export class GameState extends EventEmitter {
   constructor(game) {
      this.game = game;
   }
   
   pause() {
   }
   
   resume() {
   }
   
   dispose() {
   }
   
   handleEvent(event) {
   }
   
   step(time) {
   }

   draw(time) {
   }
}
