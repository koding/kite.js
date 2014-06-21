gulp        = require 'gulp'
browserify  = require 'browserify'
concat      = require 'gulp-concat'
uglify      = require 'gulp-uglify'
rename      = require 'gulp-rename'
coffee      = require 'gulp-coffee'
util        = require 'gulp-util'
replace     = require 'gulp-replace'
source      = require 'vinyl-source-stream'
coffeeify   = require 'coffeeify'
http        = require 'http'
ecstatic    = require 'ecstatic'

coffee4Node = -> (coffee bare: yes, sourceMap: yes).on 'error', util.log

# Build for node

gulp.task 'build commons', ->
  gulp.src 'src/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib'

gulp.task 'build logging', ->
  gulp.src 'src/logging/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/logging'

gulp.task 'build delayed', ->
  gulp.src 'src/delayed/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/delayed'

gulp.task 'build kite', ->
  gulp.src 'src/kite/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kite'

gulp.task 'build kite as promised', ->
  gulp.src 'src/kite-as-promised/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kite-as-promised'

gulp.task 'build kontrol', ->
  gulp.src 'src/kontrol/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kontrol'

gulp.task 'build kontrol as promised', ->
  gulp.src 'src/kontrol-as-promised/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kontrol-as-promised'

gulp.task 'build kite server', [
  'build websocket server adapter'
  'build sockjs server adapter'
], ->
  gulp.src 'src/kite-server/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kite-server'

gulp.task 'build websocket server adapter', ->
  gulp.src 'src/kite-server/websocket/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kite-server/websocket'

gulp.task 'build sockjs server adapter', ->
  gulp.src 'src/kite-server/sockjs/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kite-server/sockjs'

gulp.task 'build auth', ->
  gulp.src 'src/auth/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/auth'

# Build for the browser
gulp.task 'browserify kite', ->
  browserify
    entries     : ['./src/kite/kite.coffee']
    debug       : no
  .require 'events'
  .require './src/kite/kite.coffee', expose: 'kite'
  .transform coffeeify
  .bundle()
  .pipe source 'kite.coffee'
  .pipe rename 'kite-bundle.js'
  .pipe gulp.dest 'static/browser'

gulp.task 'polyfill kite', ['browserify kite'], ->
  gulp.src ['./vendor/sockjs-0.3.4.min.nojson.js', './browser/kite-bundle.js']
    .pipe concat 'kite-sock-bundle.js'
    .pipe gulp.dest 'static/browser'

gulp.task 'browserify kite as promised', ->
  browserify
    entries     : ['./src/kite-as-promised/kite.coffee']
    debug       : no
  .require 'events'
  .require './src/kite/kite.coffee'
  .require './src/kite-as-promised/kite.coffee', expose: 'kite'
  .transform coffeeify
  .bundle()
  .pipe source 'kite.coffee'
  .pipe rename 'kite-promises-bundle.js'
  .pipe gulp.dest 'static/browser'

gulp.task 'polyfill kite as promised', ['browserify kite as promised'], ->
  gulp.src ['./vendor/sockjs-0.3.4.min.nojson.js', './browser/kite-promises-bundle.js']
    .pipe concat 'kite-promises-sock-bundle.js'
    .pipe gulp.dest 'static/browser'

gulp.task 'browserify kontrol', ->
  browserify
    entries     : ['./src/kontrol/kontrol.coffee']
    debug       : no
  .external 'events'
  .external './src/kite/kite.coffee'
  .require './src/kontrol/kontrol.coffee', expose: 'kontrol'
  .transform coffeeify
  .bundle()
  .pipe source 'kontrol.coffee'
  .pipe rename 'kontrol-bundle.js'
  .pipe gulp.dest 'static/browser'

gulp.task 'browserify kontrol as promised', ->
  browserify
    entries     : ['./src/kontrol-as-promised/kontrol.coffee']
    debug       : no
  .external 'events'
  .external './src/kite/kite.coffee'
  .external './src/kite-as-promised/kite.coffee'
  .require './src/kontrol-as-promised/kontrol.coffee', expose: 'kontrol'
  .transform coffeeify
  .bundle()
  .pipe source 'kontrol.coffee'
  .pipe rename 'kontrol-promises-bundle.js'
  .pipe gulp.dest 'static/browser'

gulp.task 'build', [
  'build commons'
  'build logging'
  'build delayed'
  'build kite'
  'build kite as promised'
  'build kontrol'
  'build kontrol as promised'
  'build auth'
  'build kite server'
]

gulp.task 'browserify', [
  'browserify kite'
  'browserify kite as promised'
  'polyfill kite'
  'polyfill kite as promised'
  'browserify kontrol'
  'browserify kontrol as promised'
]

gulp.task 'uglify', ['browserify'], ->
  gulp.src 'browser/*.js'
    .pipe uglify()
    .pipe rename extname: '.min.js'
    .pipe gulp.dest 'static/browser-min'

gulp.task 'default', ['build', 'browserify', 'uglify']

gulp.task 'watch', ['default', 'playground'], ->
  gulp.watch 'src/**/*.coffee', ['default']

gulp.task 'playground', ->
  http.createServer(ecstatic root: "#{ __dirname }/static").listen 1337
  util.log util.colors.cyan 'Playground server started: http://0.0.0.0:1337'
