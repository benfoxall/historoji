(function(global){

function intersect(x1, y1, r1, x2, y2, r2) {
  return Math.sqrt(
    Math.pow(x1 - x2, 2) +
    Math.pow(y1 - y2, 2)
  ) < r1 + r2
}


// the y values for circle two that aren't allowed
function constraints( x1, y1, r1, x2, r2 ) {
  // console.log("args, ", x1, y1, r1, x2, r2)

  var x = x2 - x1,
      r = r1 + r2

  if(Math.sqrt(x*x) > r)
    return null

  var off = Math.sqrt(
    r*r - x*x
  )

  return [y1 - off, y1 + off]

}

function combine(list) {

  return list
    .filter( c => c )
    .reduce( (sofar, constraint) => {
    // look through the current constraints,
    // if we find one, remove it, and combine
    return sofar.filter( existing => {
      if(c_intersect( constraint, existing )) {
        extend(constraint, existing)
        return false // skip this one
      } else {
        return true
      }
    }).concat([constraint])

  }, [])


  function extend(a,b) {
    a[0] = Math.min(a[0], b[0])
    a[1] = Math.max(a[1], b[1])
  }

}

function c_intersect(a,b) {

  var lengths = a[1] - a[0] + b[1] - b[0]
  var total_length = Math.max(a[1], b[1]) - Math.min(a[0], b[0])

  return total_length <= lengths

}



function fill(arr, v) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = v
  }
}

const circlepack = (circles, ys) => {
  if(!ys) {
    ys = new Array(circles.length)
    fill(ys, 0)
  }
  
  var a,b,intersectors

  for (var i = 0; i < circles.length; i++) {

    // place this circle
    a = circles[i]

    // find the constraints for the circle
    var intersectors = []
    for (var j = 0; j < i; j++) {
      b = circles[j]
      if(possibleIntersect(
        a.x, a.r,
        b.x, b.r
      )) {
        // console.log(">>>>" , constraints(b.x, ys[j], b.r, a.x, a.r))
        intersectors.push(
          constraints(b.x, ys[j], b.r, a.x, a.r)
        )
      }
    }

    //
    if(intersectors.length) {
      intersectors = combine(intersectors)

      var match = intersectors.filter(m =>
        ys[i] > m[0] && ys[i] < m[1]
      )[0]

      // it can't be where it should, so
      // move it to the closest possible
      if(match) {

        ys[i] = Math.abs(match[0] - ys[i]) < Math.abs(match[1] - ys[i]) ?
                match[0] : match[1]

      }

    }

  }

  return ys


}

function possibleIntersect(x1, r1, x2, r2) {
  return x1 - r1 < x2 + r2 &&
         x1 + r1 > x2 - r2
}


global.circlepack = circlepack


})(window)
