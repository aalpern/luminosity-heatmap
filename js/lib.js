function group_and_transmogrify(photos, field) {
  var groups = _.groupBy(photos, function(p) {
    return p[field]
  })
  return Object.keys(groups).map(function(key) {
    var ps = groups[key]
    return {
      name: key,
      size: ps.length,
      photos: ps
    }
  })
}

function group_and_transmogrify_photos(node, field) {
  if (node.photos) {
    node.children = group_and_transmogrify(node.photos, field)
  }
}


function group_and_transmogrify_children(node, field) {
  if (node.children) {
    node.children.forEach(function(c) {
      c.children = group_and_transmogrify(c.photos, field)
    })
  }
}

function transmogrify2(catalog) {
  var node = {
    name:     'All',
    size:     catalog.photos.length,
    photos:   catalog.photos,
    children: group_and_transmogrify(catalog.photos, 'camera')
  }
  group_and_transmogrify_children(node, 'lens')

  node.children.forEach(function(cam) {
    cam.children.forEach(function(lens) {
      if (lens.name.indexOf('-') > -1) {
        group_and_transmogrify_photos(lens, 'focal_length')
        group_and_transmogrify_children(lens, 'fnumber')
        lens.children.forEach(function(focal_length) {
          focal_length.children.forEach(function(fnumber) {
            group_and_transmogrify_photos(fnumber, 'exposure_time')
          })
        })
      } else {
        group_and_transmogrify_photos(lens, 'fnumber')
        group_and_transmogrify_children(lens, 'exposure_time')
      }
    })
  })

  return [node]
}

function transmogrify(catalog) {
  var camera_groups = _.groupBy(catalog.photos, function(p) { return p.camera })

  camera_groups = Object.keys(camera_groups).map(function(camera) {
    var photos      = camera_groups[camera]

    var lens_groups = _.groupBy(photos, function(p) { return p.lens })
    lens_groups = Object.keys(lens_groups).map(function(lens) {
      var photos = lens_groups[lens]

      var fnumber_groups = _.groupBy(photos, function(p) { return p.fnumber })
      fnumber_groups = Object.keys(fnumber_groups).map(function(fnumber) {
        var photos = fnumber_groups[fnumber]

        var exposure_time_groups = _.groupBy(photos, function(p) { return p.exposure_time })
        exposure_time_groups = Object.keys(exposure_time_groups).map(function(exposure) {
          var photos = exposure_time_groups[exposure]

          return {
            name: exposure,
            size: photos.length
          }
        }).sort(function(l,r) {
          return l.name.localeCompare(r.name)
        })

        return {
          name: "f/" + fnumber,
          size: photos.length,
          children: exposure_time_groups
        }
      }).sort(function(l,r) {
        return l.name.localeCompare(r.name)
      })

      return {
        size: photos.length,
        name: lens,
        children: fnumber_groups
      }
    })

    return {
      name: camera,
      size: photos.length,
      children: lens_groups
    }
  })

  return [{
    name: "All",
    children: camera_groups
  }]
}
