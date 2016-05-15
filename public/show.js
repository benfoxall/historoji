// populated by fetching
var emojiMap = {}
var emojiMapDo = {}
var data = []
var w = window.innerWidth
var h = window.innerHeight

var nope = {}

var circles = []

function show() {

  var min = +Infinity,
      max = -Infinity

  data.forEach((d) => {
    min = Math.min(min,d[1])
    max = Math.max(max,d[1])
  })

  data.reverse()

  data.forEach((d) => {
    var shortcode = d[2]
    if(shortcode == 'simple_smile') shortcode = 'smile'

    var src
    if(emojiMap[shortcode]){
      src = `emoji-slack/${emojiMap[shortcode]}`
    }
    if(emojiMapDo[shortcode]){
      src = `emoji-do/${emojiMapDo[shortcode]}`
    }

    if(src) {

      var img = document.createElement('img')
      img.src = src
      img.style.transform = 'scale(0.01)'
      img.style.transitionDelay = (((d[1] - min) / (max-min)) * 2) + 's'

      document.body.appendChild(img)

      circles.push({
        time: d[1],
        x:
        (((d[1] - min) / (max-min)) * (w-50) * 1) + Math.random() * 50,
        r: 4,
        element: img
      })

      img.onerror = function(){
        console.log(emojiMap[shortcode])
      }
    } else {
      // not found
      nope[shortcode] = (nope[shortcode] || 0) + 1
    }
  })

  console.log(nope)


  //
  // circles.forEach(c => {c.element.style.left = c.x + 'px'; c.element.style.top = c.y + 'px'; c.element.style.position = 'absolute'})
  ys = circlepack(circles)

  setTimeout(function(){
      circles.forEach((c,i) => {
        c.element.style.left = c.x + 'px';
        c.element.style.top = (ys[i]+h/2) + 'px';
        c.element.style.position = 'absolute'
        c.element.style.transform = 'scale('+Math.random()+')'
      })
  },100)



}



// populate data
Promise.all([

  fetch('/emoji-slack-map.json')
    .then(r => r.json())
    .then(_ => emojiMap = _),

  fetch('/emoji-do-map.json')
    .then(r => r.json())
    .then(_ => emojiMapDo = _),

  fetch('/data')
  // fetch('/test-full.json')
    .then(r => r.json())
    .then(_ => data = _)

])
.then(show)
