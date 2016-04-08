// Copyright (c) 2016 ScoreCI
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';

var gcloud = require('gcloud');

module.exports = function(config, logging) {

  var pubsub = gcloud.pubsub(config.gcloud);


  // This configuration will automatically create the topic if
  // it doesn't yet exist. Usually, you'll want to make sure
  // that a least one subscription exists on the topic before
  // publishing anything to it as topics without subscribers
  // will essentially drop any messages.
  // [START topic]
  function getTopic(cb) {
    pubsub.createTopic(config.pubsub.topicName, function(err, topic) {
      // topic already exists.
      if (err && err.code === 409) {
        return cb(null, pubsub.topic(config.pubsub.topicName));
      }
      return cb(err, topic);
    });
  }
  // [END topic]


  // Used by the worker to listen to pubsub messages.
  // When more than one worker is running they will all share the same
  // subscription, which means that pub/sub will evenly distribute messages
  // to each worker.
  // [START subscribe]
  function subscribe(cb) {
    getTopic(function(err, topic) {
      if (err) { return cb(err); }

      topic.subscribe(config.pubsub.subscriptionName, {
        reuseExisting: true,
        maxInProgress: 1,
        ackDeadlineSeconds: 600
      }, function(err, subscription) {
        if (err) { return cb(err); }

        subscription.on('message', function(message) {
          cb(null, message);
        });

        logging.info('Listening to ' + config.pubsub.topicName + ' with subscription ' + config.pubsub.subscriptionName);
      });

    });
  }
  // [END subscribe]

  return {
    subscribe: subscribe
  };

};
