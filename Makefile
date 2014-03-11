all: browserify-bluebird uglify-bluebird build browserify build-promises browserify-promises uglify uglify-promises dev

dev: browserify-bluebird uglify-bluebird browserify-dev browserify-promises-dev

browserify-bluebird:
	node_modules/.bin/browserify -r ./node_modules/bluebird/js/main/bluebird.js > bluebird.js

uglify-bluebird:
	node_modules/.bin/uglifyjs bluebird.js -c -m -o bluebird.min.js 2>/dev/null

build:
	node_modules/.bin/coffee --bare -o ./lib/kite -c ./src/kite/*.coffee
	find ./lib/kite/*.js -type f -exec sed -i "" -e 's/\.coffee/\.js/g' {} \;

build-promises:
	node_modules/.bin/coffee --bare -o ./lib/kite-as-promised -c ./src/kite-as-promised/*.coffee
	find ./lib/kite-as-promised/*.js -type f -exec sed -i "" -e 's/\.coffee/\.js/g' {} \;

browserify:
	node_modules/.bin/browserify --standalone Kite -x bluebird -t coffeeify src/kite/kite.coffee > bundle.js

browserify-promises:
	node_modules/.bin/browserify --standalone Kite -x bluebird -t coffeeify src/kite-as-promised/kite.coffee > bundle-promises.js

browserify-dev:
	node_modules/.bin/browserify --standalone Kite -d -x bluebird -t coffeeify src/kite/kite.coffee > bundle-dev.js

browserify-promises-dev:
	node_modules/.bin/browserify --standalone Kite -d -x bluebird -t coffeeify src/kite-as-promised/kite.coffee > bundle-promises-dev.js

uglify:
	node_modules/.bin/uglifyjs bundle.js -c -m -o bundle.min.js 2>/dev/null

uglify-promises:
	node_modules/.bin/uglifyjs bundle-promises.js -c -m -o bundle-promises.min.js 2>/dev/null
