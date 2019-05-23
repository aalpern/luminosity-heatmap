// -*- mode:typescript -*-

function group_and_transmogrify(photos, field) {
  var groups = _.groupBy(photos, p => p[field])
  return Object.keys(groups).map(function(key) {
    var ps = groups[key]
    return {
      name: key || '',
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
