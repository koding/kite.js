gulp        = require 'gulp'
gulpIf      = require 'gulp-if'
browserify  = require 'gulp-browserify'
uglify      = require 'gulp-uglify'
rename      = require 'gulp-rename'
coffee      = require 'coffee-script'

gulp.task 'browserify bluebird', ->
  gulp.src './node_modules/bluebird/js/main/bluebird.js'
    .pipe browserify
      debug   : no
      require : ['./bluebird.js']
    .pipe gulp.dest "./browser/"

gulp.task 'uglify bluebird', ['browserify bluebird'], ->
  gulp.src './browser/bluebird.js'
    .pipe uglify()
    .pipe rename 'bluebird.min.js'
    .pipe gulp.dest "./browser/"

gulp.task 'browserify kite', ->
  gulp.src './src/kite/kite.coffee', read: no
    .pipe browserify
      debug     : no
      transform : ['coffeeify']
      standalone: 'Kite'
    .pipe rename 'kite-bundle.js'
    .pipe gulp.dest './browser/'

gulp.task 'browserify kite as promised', ->
  gulp.src './src/kite-as-promised/kite.coffee', read: no
    .pipe browserify
      debug     : no
      transform : ['coffeeify']
      standalone: 'Kite'
      external  : ['bluebird']
    .pipe rename 'kite-promises-bundle.js'
    .pipe gulp.dest './browser/'

gulp.task 'browserify kontrol', ->
  gulp.src './src/kontrol/kontrol.js', read: no
    .pipe browserify
      debug     : no
      transform : ['coffeeify']
      standalone: 'Kontrol'
    .pipe rename 'kontrol-bundle.js'
    .pipe gulp.dest './browser/'

gulp.task 'browserify kontrol as promised', ->
  gulp.src './src/kite-as-promised/kite.coffee', read: no
    .pipe browserify
      debug     : no
      transform : ['coffeeify']
      standalone: 'Kite'
      external  : ['bluebird']
    .pipe rename 'kontrol-promises-bundle.js'
    .pipe gulp.dest './browser/'

gulp.task 'default', [
  'browserify bluebird'
  'uglify bluebird'
  'browserify kite'
  'browserify kite as promised'
  'browserify kontrol'
  'browserify kontrol as promised'
]
