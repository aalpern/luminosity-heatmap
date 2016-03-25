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
