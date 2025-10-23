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
git push origin  https://github.com/Noxalas/project_cookieguard.git

echo "Egen push "

git push backup  https://github.com/Meron07/CookiesGuard.git

echo "$message"
