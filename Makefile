all: bluebird kite kontrol

bluebird: browserify-bluebird uglify-bluebird

kite: build-kite browserify-kite build-kite-promises browserify-kite-promises uglify-kite uglify-kite-promises kite-dev

kontrol: build-kontrol browserify-kontrol build-kontrol-promises browserify-kontrol-promises uglify-kontrol uglify-kontrol-promises kontrol-dev

kite-dev: bluebird browserify-kite-dev browserify-kite-promises-dev

kontrol-dev: bluebird browserify-kontrol-dev browserify-kontrol-promises-dev

browserify-bluebird:
	mkdir -p browser
	node_modules/.bin/browserify -r ./node_modules/bluebird/js/main/bluebird.js > browser/bluebird.js

uglify-bluebird:
	node_modules/.bin/uglifyjs browser/bluebird.js -c -m -o browser/bluebird.min.js 2>/dev/null

build-kite:
	node_modules/.bin/coffee -b -o ./lib/kite -c ./src/kite/*.coffee
	find ./lib/kite/*.js -type f -exec sed -i "" -e 's/\.coffee/\.js/g' {} \;

build-kite-promises:
	node_modules/.bin/coffee -b -o ./lib/kite-as-promised -c ./src/kite-as-promised/*.coffee
	find ./lib/kite-as-promised/*.js -type f -exec sed -i "" -e 's/\.coffee/\.js/g' {} \;

browserify-kite:
	node_modules/.bin/browserify -s Kite -t coffeeify src/kite/kite.coffee > browser/kite-bundle.js

browserify-kite-promises:
	node_modules/.bin/browserify -s Kite -t coffeeify -x bluebird src/kite-as-promised/kite.coffee > browser/kite-bundle-promises.js

browserify-kite-dev:
	node_modules/.bin/browserify -s Kite -d -t coffeeify src/kite/kite.coffee > browser/kite-bundle-dev.js

browserify-kite-promises-dev:
	node_modules/.bin/browserify -s Kite -d -t coffeeify -x bluebird src/kite-as-promised/kite.coffee > browser/kite-bundle-promises-dev.js

uglify-kite:
	node_modules/.bin/uglifyjs browser/kite-bundle.js -c -m -o browser/kite-bundle.min.js 2>/dev/null

uglify-kite-promises:
	node_modules/.bin/uglifyjs browser/kite-bundle-promises.js -c -m -o browser/kite-bundle-promises.min.js 2>/dev/null

build-kontrol:
	node_modules/.bin/coffee -b -o ./lib/kontrol -c ./src/kontrol/*.coffee
	find ./lib/kontrol/*.js -type f -exec sed -i "" -e 's/\.coffee/\.js/g' {} \;

build-kontrol-promises:
	node_modules/.bin/coffee -b -o ./lib/kontrol-as-promised -c ./src/kontrol-as-promised/*.coffee
	find ./lib/kontrol-as-promised/*.js -type f -exec sed -i "" -e 's/\.coffee/\.js/g' {} \;

browserify-kontrol:
	node_modules/.bin/browserify -s Kontrol -t coffeeify -x bluebird src/kontrol/kontrol.coffee > browser/kontrol-bundle.js

browserify-kontrol-promises:
	node_modules/.bin/browserify -s Kontrol -t coffeeify -x bluebird src/kontrol-as-promised/kontrol.coffee > browser/kontrol-bundle-promises.js

browserify-kontrol-dev:
	node_modules/.bin/browserify -s Kontrol -d -t coffeeify -x bluebird src/kontrol/kontrol.coffee > browser/kontrol-bundle-dev.js

browserify-kontrol-promises-dev:
	node_modules/.bin/browserify -s Kontrol -d -t coffeeify -x bluebird src/kontrol-as-promised/kontrol.coffee > browser/kontrol-bundle-promises-dev.js

uglify-kontrol:
	node_modules/.bin/uglifyjs browser/kontrol-bundle.js -c -m -o browser/kontrol-bundle.min.js 2>/dev/null

uglify-kontrol-promises:
	node_modules/.bin/uglifyjs browser/kontrol-bundle-promises.js -c -m -o browser/kontrol-bundle-promises.min.js 2>/dev/null
