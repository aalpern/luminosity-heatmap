Handlebars.registerPartial('stat', $('#stat').html());
var tmpl = Handlebars.compile($('#heatmap-template').html());

$.ajax({
  url: 'data.json',
  dataType: 'json',

  success: function(data) {
    data.forEach(function(entry) {
      entry.date = new Date(entry.label)
    });

    by_year = _.groupBy(data, function(entry) {
      return entry.date.getFullYear();
    });

    Object.keys(by_year).forEach(function(year) {
      var stats = by_year[year];
      var sum   = _.reduce(stats, function(m, n) { return m + n.count }, 0);
      var max   = _.reduce(stats, function(m, n) { return Math.max(m, n.count) }, 0);

      $('#report').append(tmpl({
        year: year,
        sum: sum,
        stats: [
          { label: 'Total', value: d3.format(',3')(sum), cls: 'total' },
          { label: 'Max in one day', value: d3.format(',3')(max) }
        ]
      }));

      var id    = '#y' + year
      var start = new Date(year + '-01-01T00:00');
      var end   = new Date(year + '-12-31T23:59');
      if (true) {
        var heatmap = calendarHeatmap()
            .data(by_year[year])
            .dateRange(start, end)
            .selector(id)
            .colorRange(['#D6E685', '#1E6823'])
        // .colorRange(['#E6D685', '#681E23'])
            .tooltipEnabled(true);
        heatmap();
      }
    });
  }
});
