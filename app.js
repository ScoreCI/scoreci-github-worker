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

var express = require('express');
var config = require('./config');
var logging = require('./lib/logging')(config.logPath);
var background = require('./lib/background')(config, logging);
var execSync = require('child_process').execSync;

// When running on Google App Engine Managed VMs, the worker needs
// to respond to HTTP requests and can optionally supply a health check.
var app = express();

app.use(logging.requestLogger);

app.get('/_ah/health', function(req, res) {
  res.status(200).send('ok');
});


// Keep count of how many books this worker has processed
var importCount = 0;

app.get('/', function(req, res) {
  res.send("<p>GitHub project worker running.</p>" +
		"<p>Proccessed "+importCount+" github projects</p>" +
  		"<p>TOPIC NAME: "+config.pubsub.topicName+"</p>"+
  		"<p>SUBSCRIPTION NAME: "+config.pubsub.subscriptionName+"</p>");
});

app.use(logging.errorLogger);


var server = app.listen(config.port || 8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});


// Subscribe to Cloud Pub/Sub and receive messages to process github projects.
// The subscription will continue to listen for messages until the process
// is killed.
background.subscribe(function(err, message) {
  // Any errors received are considered fatal.
  if(err) { 
    logging.error('Error occurred', err);
    throw err; 
  }
  handleMessage(message);
});


function handleMessage(message) {
  logging.info('message.ackId ='+message.ackId);
  var ackId = message.ackId;
  
  var attrs = message.attributes;
  if(attrs == null){
    logging.warn('Unknown request'+ message);
    
    message.ack(function(err, apiResponse) {
      logging.log('apiResponse ='+apiResponse);
      if(err) { 
        throw err; 
      }
    });
    return;
  }

  if(!attrs.username ||
    !attrs.githubFullname ||
    !attrs.githubProjectName || 
    !attrs.token){

    logging.warn('Missing attributes'+ message);
    
    message.ack(function(err, apiResponse) {
      logging.info('apiResponse ='+apiResponse);
      if(err) { 
        throw err; 
      }
    });
    return;
  }

  logging.info('attrs.username ='+attrs.username);
  var username = attrs.username;

  logging.info('attrs.githubFullname ='+attrs.githubFullname);
  var githubFullname = attrs.githubFullname;

  logging.info('attrs.githubProjectName ='+attrs.githubProjectName);
  var githubProjectName = attrs.githubProjectName;

  logging.info('attrs.token ='+attrs.token);
  var token = attrs.token;

  function puts(error, stdout, stderr) { 
      logging.info(stdout);
      logging.error(stderr);
      if (error !== null) {
    	  logging.error("exec error: ${error}");
      }
  }

  //Execute import script
  logging.info('Start script execution');
  execSync("sh scripts/import_github_project.sh "+username+" "+githubFullname+" "+githubProjectName+" "+token, puts);
  logging.info('End script execution');
  
  message.ack(function(err, apiResponse) {
    logging.log('apiResponse ='+apiResponse);
    if(err) { 
      throw err; 
    }
  });
  
  importCount += 1;
}