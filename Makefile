all: build browserify

build:
	node_modules/.bin/coffee --bare -o ./lib/kite -c ./src/kite/*.coffee
	find ./lib/kite/*.js -type f -exec sed -i "" -e 's/\.coffee/\.js/g' {} \;

browserify:
	node_modules/.bin/browserify --standalone Kite -d -t coffeeify src/kite/kite.coffee > bundle.js
