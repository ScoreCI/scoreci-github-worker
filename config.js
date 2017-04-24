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

var config = function () {
	return {
	    port: process.env.PORT || 8080,
	    
	    nodeEnv: process.env.NODE_ENV || 'your-environment',

	    projectId: process.env.GCLOUD_PROJECT || 'your-project-id',
		credential: process.env.GCLOUD_KEY_FILENAME || 'your-project-credential',

		// Topic and subscription for pub sub
		pubsub: {
			topicName: process.env.GCLOUD_TOPIC || 'your-pubsub-topic',
			subscriptionName: process.env.GCLOUD_SUBSCRIPTION || 'your-pubsub-subscription'
	    }
	};
}();

var nodeEnv = config.nodeEnv;
if(!nodeEnv || nodeEnv === 'your-environment'){
	throw new Error('You must set the NODE_ENV env var or add your node env to config.js!');
}else{
	//add prodEnv variable in config
	config.prodEnv = process.env.NODE_ENV === 'production' ? true : false;
}

// https://github.com/GoogleCloudPlatform/google-cloud-node
var prodEnv = config.prodEnv;
if(!prodEnv){
	var projectId = config.projectId;
    if (!projectId || projectId === 'your-project-id') {
    	throw new Error('You must set the GCLOUD_PROJECT env var or add your project id to config.js!');
    }
    var credential = config.credential;
	if(!credential || credential === 'your-project-credential'){
		throw new Error('You must set the GCLOUD_KEY_FILENAME env var or add your credential filename to config.js!');
	}
    //Add credential to gcloud config
    config.gcloud.projectId = projectId;
    config.gcloud.keyFilename = credential;
	
}

var topicName = config.pubsub.topicName;
var subscriptionName = config.pubsub.subscriptionName;

if (!topicName || topicName === 'your-pubsub-topic') {
	throw new Error('You must set the GCLOUD_TOPIC env var or add your topic name to config.js!');
}

if (!topicName || topicName === 'your-pubsub-subscription') {
	throw new Error('You must set the GCLOUD_SUBSCRIPTION env var or add your topic name to config.js!');
}

module.exports = config;
