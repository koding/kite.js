all: build browserify build-promises browserify-promises

build:
	node_modules/.bin/coffee --bare -o ./lib/kite -c ./src/kite/*.coffee
	find ./lib/kite/*.js -type f -exec sed -i "" -e 's/\.coffee/\.js/g' {} \;

build-promises:
	node_modules/.bin/coffee --bare -o ./lib/kite-as-promised -c ./src/kite-as-promised/*.coffee
	find ./lib/kite-as-promised/*.js -type f -exec sed -i "" -e 's/\.coffee/\.js/g' {} \;

browserify:
	node_modules/.bin/browserify --standalone Kite -d -t coffeeify src/kite/kite.coffee > bundle.js

browserify-promises:
	node_modules/.bin/browserify --standalone Kite -d -t coffeeify src/kite-as-promised/kite.coffee > bundle-promises.js
