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
