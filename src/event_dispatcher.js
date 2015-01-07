export var EventDispatcher = (function() {
   function EventDispatcher() {
      this.events = [];
   }

   EventDispatcher.prototype.addEventListener = function(type, callback) {
      this.events[type] = this.events[type] || [];

      if ( this.events[type] ) {
         this.events[type].push(callback);
      }
   }

   EventDispatcher.prototype.removeEventListener = function(type, callback) {
      if ( this.events[type] ) {
         var listeners = this.events[type];

         for ( var i = listeners.length-1; i >=0; --i ){
            if ( listeners[i] === callback ) {
               listeners.splice( i, 1 );
               return true;
            }
         }
      }

      return false;
   }

   EventDispatcher.prototype.dispatchEvent = function(event) {
      if ( this.events[event.type] ) {
         var listeners = this.events[event.type];
         var length = listeners.length;

         while ( length-- ) {
            console.log('yep');
            listeners[length].call(event);
         }
      }
   }

   return EventDispatcher;
})();
