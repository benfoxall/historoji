importScripts('bower_components/sw-toolbox/sw-toolbox.js')

toolbox.precache([
  '/bower_components/es6-promise/es6-promise.min.js',
  '/bower_components/fetch/fetch.js',
  '/circlepack.js',
  '/show.js',
  '/',

  '/emoji-slack-map.json',
  '/emoji-do-map.json',

  // '/data'
])

// imoji maps and images
toolbox.router.get(/emoji-.*/, toolbox.cacheFirst)


toolbox.router.default = toolbox.networkFirst
toolbox.networkTimeoutSeconds = 3
