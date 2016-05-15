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

      document.body.appendChild(img)

      circles.push({
        d: d,
        x:
        (((d[1] - min) / (max-min)) * (w-50) * 1) + Math.random() * 50,
        r: 3 + (Math.random() * 4),
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

  console.log("missing:", nope)



  var _ys = circles.map( f => h/2 )

  circlepack(circles, _ys)


  // initial positions
  circles.forEach((c,i) => {
    c.element.style.left =
    c.element.style.top = 0
    c.element.style.position = 'absolute'


    c.element.style.transform =
      `translate(${c.x}px, ${(_ys[i])}px) scale(0.08) rotate(${~~((Math.random()-.5)*360)}deg)`

    c.element.style.transitionDelay = (i/circles.length) * 10 + 's'
  })


  actions.all = show
  actions.person = show.bind(null, 5)
  actions.channel = show.bind(null, 4)


  // I'd usually sprinkle "this is a terrible hack" apologies
  // through this… but, it's like the whole thing.
  switch(document.location.search){
    case '?by=person':
      setTimeout(actions.person, 100)
      break
    case '?by=channel':
      setTimeout(actions.channel, 100)
      break
    case '?nope':
      break
    default:
      setTimeout(actions.all, 100)
  }


  function show (key) {

    // remove any existing headings
    var headings = document.getElementsByTagName('h2')
    for(var i = headings.length - 1; i>=0; i--) {
      headings[i].remove()
    }


    if(!key) {
      circles.forEach((c,i) => {
        c.element.style.transform =
          `translate(${c.x}px, ${(_ys[i])}px) scale(${c.r/6})`
      })

      return;
    }

    var items = order(group(key))

    // look up for item => start y position
    var itemsY = items.reduce( (memo, item, i) => {
      memo[item] = (i * 200) + 100
      return memo
    }, {})

    // the y position for each circle
    var ys = circles.map( c =>
      itemsY[c.d[key]]
    )

    circlepack(circles, ys)




    var headings = items.map( (p, i) => {
      var h2 = document.createElement('h2')
      h2.id = p
      h2.textContent = p
      h2.style.position = 'absolute'
      h2.style.top = (i * 200) + 'px'
      h2.style.transform = 'translateX(-100%)'
      document.body.appendChild(h2)

      return h2
    })

    // flick the hash on and off to scroll to a new id perhaps
    var hs = document.location.hash
    document.location.hash = ''
    document.location.hash = hs

    setTimeout(function(){
      headings.forEach(function(h){
        h.style.transform = ''
      })


    }, 2500)

    circles.forEach((c,i) => {
      c.element.style.transform =
        `translate(${c.x}px, ${(ys[i])}px) scale(${c.r/6})`
    })
  }

}



var group = key =>
  data.reduce( (memo, item) => {
    memo[item[key]] = (memo[item[key]]||0) + 1
    return memo
  }, {})

var order = obj =>
  Object.keys(obj).sort( (a, b) =>
    obj[b] - obj[a]
  )




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

var actions = {}


document.addEventListener('click', function(e) {
  var replace = e.target.getAttribute('data-replace-state')

  if(replace){
    e.preventDefault()
    console.log("prevented")
    if(actions[replace]){
      actions[replace]()
    } else {
      console.log("NO ACTION (%s)", replace)
    }

    history.replaceState({},'', e.target.href)
  }

}, false)
