
browserify:
	node_modules/.bin/browserify --standalone Kite -d -t coffeeify src/kite/kite.coffee > bundle.js

serve:
	node_modules/.bin/serve .
