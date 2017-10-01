#!/usr/bin/env bash

for CMD in 'dev-server' 'chrome' 'watch'
do
    sleep 2s
    osascript -e "tell application \"Terminal\" to do script \"cd ${PWD};npm run ${CMD}\""
done
