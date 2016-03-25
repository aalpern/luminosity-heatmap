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



$.ajax({
  url: 'catalog.json',
  dataType: 'json',

  success: function(catalog) {
    window.catalog = catalog
    var by_date = catalog.stats.by_date

    by_date = by_date.filter(function(entry) {
      return entry.label !== "";
    })

    var data = {}

    by_date.forEach(function(entry) {
      entry.date = moment(entry.label)
      data[entry.date.unix()] = entry.count;
    })

    // var sum   = _.reduce(by_date, function(m, n) { return m + n.count }, 0);
    // var min   = _.reduce(by_date, function(m, n) { return Math.min(m, n.count) }, 0);

    var start = by_date[0].date
    var end   = by_date[by_date.length - 1].date
    var dur   = moment.duration(end.unix() - start.unix(), 'seconds')
    var range = Math.round(dur.asYears()) || 1

    var max   = _.reduce(by_date, function(m, n) { return Math.max(m, n.count) }, 0);
    var step  = max / 5
    var steps = [0, step, step * 2, step * 3, step * 4]
    var cal   = new CalHeatMap();

    cal.init({
      itemSelector: "#heatmap",
      domain: 'year',
      subDomain: 'day',
      range: range,
      start: start.toDate(),
      data: data,
      tooltip: true,
      displayLegend: false,
      domainDynamicDimension: false,
      legend: steps,
      legendColors: ['#D6E685', '#1E6823']
    });

    var sunburst_data = transmogrify(catalog);
    var chart;
    nv.addGraph(function() {
      chart = nv.models.sunburstChart();
      // chart.showLabels(true);
      chart.color(d3.scale.category20c());
      d3.select("#sunburst")
      .datum(sunburst_data)
      .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });

  }
});
