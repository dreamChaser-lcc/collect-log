#!/bin/bash

basePath=/data/code
projPath=$basePath/collect

logBasePath=/data/logs/nodejs
outlogPath=$logBasePath/collect_out.log
errorlogPath=$logBasePath/collect_error.log

pm2 stop collect
pm2 delete collect

cd $projPath
#rm -rf node_modules
cnpm install

cd $projPath

is_running=`ps aux | grep /data/code/collect/server/startup.js | grep -v grep | wc -l`

if [[ "$is_running" -gt 0 ]]
then
  pm2 reload server/startup.js -i 0 --name "collect"  --output $outlogPath --error $errorlogPath --merge-logs --log-date-format "YYYY-MM-DD HH:mm Z" -- -m prod -p 5000 -h 0.0.0.0
else
  pm2 start server/startup.js -i 0  --name "collect" --output $outlogPath --error $errorlogPath --merge-logs --log-date-format "YYYY-MM-DD HH:mm Z" -- -m prod -p 5000 -h 0.0.0.0
fi                                              