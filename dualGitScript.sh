#! /bin/bash

set -e # error for skyld 

message=$1


if [ -z "$message" ];
then
echo "husk å bruke commit først tho " 
exit 1
fi

git add .
git commit -m "$message" 
git push

echo "Gruppen sin push "
git push origin main

echo "Egen push "

git push backup main

echo "$message"
