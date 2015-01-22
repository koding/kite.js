BIN=./node_modules/.bin

dist: clean kite kontrol bundle
	@mkdir -p dist
	@mv kite.js dist
	@mv kontrol.js dist
	@mv bundle.* dist

kite:
	@$(BIN)/browserify -t coffeeify --extension=".coffee" \
		-o kite.js --standalone Kite lib/kite/index.coffee

kontrol:
	@$(BIN)/browserify -t coffeeify --extension=".coffee" \
		-o kontrol.js --standalone Kontrol lib/kontrol/index.coffee

bundle:
	@$(BIN)/browserify -t coffeeify --extension=".coffee" \
		-o bundle.js --standalone kite lib/index.coffee
	@$(BIN)/uglifyjs bundle.js \
		--mangle -c hoist_vars=true,if_return=true \
		--screw-ie8 \
		-o bundle.min.js \
		--source-map bundle.min.map --source-map-include-sources

clean:
	@rm -fr dist
