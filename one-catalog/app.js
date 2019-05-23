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

    var sunburst_data = transmogrify2(catalog);
    var chart;
    nv.addGraph(function() {
      chart = nv.models.sunburstChart();
      chart.color(d3.scale.category20c());
      d3.select("#sunburst")
      .datum(sunburst_data)
      .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    }); 

  }
});
