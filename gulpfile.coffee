gulp        = require 'gulp'
browserify  = require 'gulp-browserify'
uglify      = require 'gulp-uglify'
rename      = require 'gulp-rename'
coffee      = require 'gulp-coffee'
util        = require 'gulp-util'
replace     = require 'gulp-replace'

coffee4Node = -> (coffee bare: yes, sourceMap: yes).on 'error', util.log

gulp.task 'build kite', ->
  gulp.src 'src/kite/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kite'

gulp.task 'browserify kite', ->
  gulp.src 'src/kite/kite.coffee', read: no
    .pipe browserify
      debug       : no
      transform   : ['coffeeify']
      standalone  : 'Kite'
    .pipe rename 'kite-bundle.js'
    .pipe gulp.dest 'browser'

gulp.task 'build kite as promised', ->
  gulp.src 'src/kite-as-promised/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kite-as-promised'

gulp.task 'browserify kite as promised', ->
  gulp.src 'src/kite-as-promised/kite.coffee', read: no
    .pipe browserify
      debug       : no
      transform   : ['coffeeify']
      standalone  : 'Kite'
      external    : ['bluebird']
    .pipe rename 'kite-promises-bundle.js'
    .pipe gulp.dest 'browser'

gulp.task 'build kontrol', ->
  gulp.src 'src/kontrol/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kontrol'

gulp.task 'browserify kontrol', ->
  gulp.src 'src/kontrol/kontrol.coffee', read: no
    .pipe browserify
      debug       : no
      transform   : ['coffeeify']
      standalone  : 'Kontrol'
    .pipe rename 'kontrol-bundle.js'
    .pipe gulp.dest 'browser'

gulp.task 'build kontrol as promised', ->
  gulp.src 'src/kontrol-as-promised/*.coffee'
    .pipe coffee4Node()
    .pipe replace '.coffee', '.js'
    .pipe gulp.dest 'lib/kontrol-as-promised'

gulp.task 'browserify kontrol as promised', ->
  gulp.src 'src/kontrol-as-promised/kontrol.coffee', read: no
    .pipe browserify
      debug       : no
      transform   : ['coffeeify']
      standalone  : 'Kontrol'
    .pipe rename 'kontrol-promises-bundle.js'
    .pipe gulp.dest 'browser'

gulp.task 'build', [
  'build kite'
  'build kite as promised'
  'build kontrol'
  'build kontrol as promised'
]

gulp.task 'browserify', [
  'browserify kite'
  'browserify kite as promised'
  'browserify kontrol'
  'browserify kontrol as promised'
]

gulp.task 'default', ['build', 'browserify']
