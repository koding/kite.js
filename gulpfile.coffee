gulp        = require 'gulp'
browserify  = require 'gulp-browserify'
uglify      = require 'gulp-uglify'
rename      = require 'gulp-rename'
coffee      = require 'coffee-script'

gulp.task 'browserify kite', ->
  gulp.src 'src/kite/kite.coffee', read: no
    .pipe browserify
      debug       : no
      transform   : ['coffeeify']
      standalone  : 'Kite'
    .pipe rename 'kite-bundle.js'
    .pipe gulp.dest 'browser'

gulp.task 'browserify kite as promised', ->
  gulp.src 'src/kite-as-promised/kite.coffee', read: no
    .pipe browserify
      debug       : no
      transform   : ['coffeeify']
      standalone  : 'Kite'
      external    : ['bluebird']
    .pipe rename 'kite-promises-bundle.js'
    .pipe gulp.dest 'browser'

gulp.task 'browserify kontrol', ->
  gulp.src 'src/kontrol/kontrol.coffee', read: no
    .pipe browserify
      debug       : no
      transform   : ['coffeeify']
      standalone  : 'Kontrol'
    .pipe rename 'kontrol-bundle.js'
    .pipe gulp.dest 'browser'

gulp.task 'browserify kontrol as promised', ->
  gulp.src 'src/kontrol-as-promised/kontrol.coffee', read: no
    .pipe browserify
      debug       : no
      transform   : ['coffeeify']
      standalone  : 'Kontrol'
    .pipe rename 'kontrol-promises-bundle.js'
    .pipe gulp.dest 'browser'

gulp.task 'build', [
  'browserify kite'
  'browserify kite as promised'
  'browserify kontrol'
  'browserify kontrol as promised'
]

gulp.task 'default', ['build']
