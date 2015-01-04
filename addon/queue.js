import Em from 'ember';
import Message from './message';
import defaultFor from './utils/default-for';

export default Em.ArrayProxy.extend({
  content: Em.A(),
  currentMessage: Em.computed.oneWay('queuedMessages.firstObject'),
  interval: 3000, // Duration to show each message
  nonTimedMessages: Em.computed.filterBy('content', 'timed', false),
  queuedMessages: Em.computed.filterBy('content', 'timed', true),

  clear: function() {
    this.set('content', Em.A());
  },

  pushMessage: function(type, content, duration) {
    duration = defaultFor(duration, this.get('interval'));

    this.pushObject(
      Message.create({
        content: content,
        duration: duration,
        type: type
      })
    );
  },

  removeMessage: function(message) {
    var message = defaultFor(message, this.get('currentMessage'));

    if (this.indexOf(message) > -1) {
      this.removeObject(message);
    } else {
      Em.warn('Message not found in message queue: ' + JSON.stringify(message));
    }
  },

  _queueDidChange: function() {
    var currentMessage = this.get('currentMessage');
    var duration;

    // If there is another message in the queue...
    if (currentMessage) {
      duration = currentMessage.get('duration');

      // ... then send that message to be removed
      Em.run.throttle(this, this._delayRemoval, currentMessage, duration, duration);
    }
  }.observes('currentMessage'),

  _delayRemoval: function(message, duration) {
    Em.run.later(this, this.removeMessage, message.get('id'), duration);
  },

}).create();
