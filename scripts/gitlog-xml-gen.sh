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

# This script call git log command and transform the console output into an xml file

##Declare local variables 
# XML element and attribute names
SCMCOMMITS_ROOT_ELEM=scmcommits
ADDITIONS_ATTR=additions
DELETIONS_ATTR=deletions
SCMCOMMIT_ELEM=scmcommit
SCMFILECHANGE_ELEM=scmfilechange
COMMIT_ID_ATTR=commit
AUTHOR_EMAIL_ATTR=authoremail
COMMITTER_EMAIL_ATTR=committeremail
DATE_ATTR=datecommitted
# file names
DATE_PARAM=$1
XML_FILE=scmcommits_$DATE_PARAM.xml
TARGZ_FILE=scoreci_$DATE_PARAM.tar.gz
echo $DATE_PARAM
echo $XML_FILE
echo $TARGZ_FILE

## Create XML header
echo "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" > $XML_FILE
echo "<$SCMCOMMITS_ROOT_ELEM>" >> $XML_FILE

## Execute git log command with pretty format option.
git log \
	--numstat \
	--pretty=format:\
"</$SCMCOMMIT_ELEM>
<$SCMCOMMIT_ELEM 
	$COMMIT_ID_ATTR=\"%H\" 
	$AUTHOR_EMAIL_ATTR=\"%ae\" 
	$COMMITTER_EMAIL_ATTR=\"%ce\" 
	$DATE_ATTR=\"%cd\" >" | \
# Parse and convert file changes lines into xml format.
sed "s/\(^[0-9-][0-9]*\)[[:space:]]\([0-9-]*\)[[:space:]].*$/<$SCMFILECHANGE_ELEM $ADDITIONS_ATTR=\"\1\" $DELETIONS_ATTR=\"\2\" \/>/g" | \
# Delete last line since pretty format start with ending xml tag </$SCMCOMMIT_ELEM>
sed '1d' >> $XML_FILE

##Create xml footer
echo "</$SCMCOMMIT_ELEM>" >> $XML_FILE
echo "</$SCMCOMMITS_ROOT_ELEM>" >> $XML_FILE

##compress file into tar.gz format
tar -zcvf $TARGZ_FILE $XML_FILE

##Remove xml file
rm $XML_FILE