#!/bin/bash
cd node_modules
git clone git@github.com:petkaantonov/bluebird.git
cd bluebird
npm install
node_modules/.bin/grunt build --features="core filter map reduce nodeify timers"