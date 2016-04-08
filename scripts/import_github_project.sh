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

## Fetch variables
USERNAME=$1
GITHUB_FULLNAME=$2
GITHUB_PROJECT_NAME=$3
TOKEN=$4
CURRENT_DATE=$(date +"%y-%m-%d-%H-%M-%S")
echo "USERNAME = $USERNAME"
echo "GITHUB_FULLNAME = ${GITHUB_FULLNAME}"
echo "GITHUB_PROJECT_NAME = ${GITHUB_PROJECT_NAME}"
echo "TOKEN = ${TOKEN}"
echo "ACK_ID = ${ACK_ID}"
echo "CURRENT_DATE = ${CURRENT_DATE}"

## Create project working directory
echo "Create project folder ${USERNAME}/${GITHUB_PROJECT_NAME}"
cd tmp
mkdir $USERNAME
cd $USERNAME
echo `pwd`

## Clone git repository
echo "Clone github project ${GITHUB_FULLNAME}"
git clone https://github.com/$GITHUB_FULLNAME.git 


cd $GITHUB_PROJECT_NAME
echo `pwd`

## Run gitlog to xml script
sh ../../../scripts/gitlog-xml-gen.sh $CURRENT_DATE

## fetch upload url
echo "Request Upload URL from https://scoreci.com/upload?username=${USERNAME}&project_name=${GITHUB_PROJECT_NAME}&token=${TOKEN}"
CURL_OUTPUT=$(curl -s "https://scoreci.com/upload?username=${USERNAME}&project_name=${GITHUB_PROJECT_NAME}&token=${TOKEN}")
echo $CURL_OUTPUT

UPLOAD_URL=$(echo $CURL_OUTPUT | sed "s/{\"url\":\"//g" | sed "s/\"}//g")
echo "Upload URL"
echo $UPLOAD_URL

## Upload file
curl -F "uploadfile=@scoreci_${CURRENT_DATE}.tar.gz;type=application/x-gzip" $UPLOAD_URL

## Clean up working directory
echo "Delete Repository"
cd ../..
rm -rf $USERNAME;

echo "Done"

