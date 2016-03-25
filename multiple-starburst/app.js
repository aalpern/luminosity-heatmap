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
        })

        return {
          name: "f/" + fnumber,
          children: exposure_time_groups
        }
      })

      return {
        name: lens,
        children: fnumber_groups
      }
    })

    return {
      name: camera,
      children: lens_groups
    }
  })

  return [{
    name: "All",
    children: camera_groups
  }]
}

catalogs = [
  "c1",
  "c2",
  "c3",
  "c4",
  "c5"
]

catalogs.forEach(function(name) {
  $.ajax({
    url: name + '.json',
    dataType: 'json',

    success: function(catalog) {
      var sunburst_data = transmogrify(catalog);
      var chart;
      nv.addGraph(function() {
        chart = nv.models.sunburstChart();
        // chart.showLabels(true);
        // chart.color(d3.scale.category20c());
        // var scale = d3.scale.ordinal()
        // .range()
        var scale = d3.scale.category20c()
        chart.color(scale)

        d3.select("#" + name)
        .datum(sunburst_data)
        .call(chart);
        nv.utils.windowResize(chart.update);
        return chart;
      });

    }
  });
});
