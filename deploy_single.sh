#!/bin/bash

# The MIT License (MIT)

# Copyright (c) 2016 ScoreCI

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

set -ex

ZONE=us-central1-f
INSTANCE_NAME=scoreci-github-worker
MACHINE_TYPE=n1-standard-1
IMAGE_FAMILY=debian-8
IMAGE_PROJECT=debian-cloud
STARTUP_SCRIPT=startup-script.sh
SCOPES="https://www.googleapis.com/auth/cloud-platform"
TAGS=http-server


#
# Instance setup
#
echo "Create Instance."
gcloud compute instances create $INSTANCE_NAME \
    --image-family $IMAGE_FAMILY \
    --image-project $IMAGE_PROJECT \
    --machine-type $MACHINE_TYPE \
    --scopes $SCOPES \
    --metadata-from-file startup-script=$STARTUP_SCRIPT \
    --tags $TAGS \
    --zone $ZONE

# [START create_firewall]
echo "Create Firewall Rules."
gcloud compute firewall-rules create default-allow-http-8080 \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --target-tags http-server \
    --description "Allow port 8080 access to http-server"
# [END create_firewall]
echo "Done."

