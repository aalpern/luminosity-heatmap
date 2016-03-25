Handlebars.registerPartial('stat', $('#stat').html());
var tmpl = Handlebars.compile($('#heatmap-template').html());

$.ajax({
  url: 'data.json',
  dataType: 'json',

  success: function(catalog) {
    var data = catalog.stats.by_date
    data = data.filter(function(entry) {
      return entry.label !== "";
    })
    data.forEach(function(entry) {
      entry.date = new Date(entry.label)
    });

    var by_year = _.groupBy(data, function(entry) {
      return entry.date.getFullYear();
    });

    Object.keys(by_year).forEach(function(year) {
      var stats = by_year[year];
      var sum   = _.reduce(stats, function(m, n) { return m + n.count }, 0);
      var max   = _.reduce(stats, function(m, n) { return Math.max(m, n.count) }, 0);
      var min   = _.reduce(stats, function(m, n) { return Math.min(m, n.count) }, 0);
      var step  = max / 5
      var steps = [0, step, step * 2, step * 3, step * 4]

      $('#report').append(tmpl({
        year: year,
        sum: sum,
        stats: [
          { label: 'Total', value: d3.format(',3')(sum), cls: 'total' },
          { label: 'Max/day', value: d3.format(',3')(max) }
        ]
      }));

      var id    = '#y' + year;
      var start = new Date(year, 0, 1)
      var end   = new Date(year, 11, 31)
      var cal   = new CalHeatMap();

      var cal_data = {}
      stats.forEach(function(value) {
        cal_data[value.date.getTime() / 1000] = value.count;
      });

      cal.init({
        itemSelector: id,
        domain: 'year',
        subDomain: 'day',
        range: 1,
        start: start,
        minDate: start,
        maxDate: end,
        data: cal_data,
        tooltip: true,
        displayLegend: false,
        domainDynamicDimension: false,
        domainLabelFormat: "",
        legend: steps,
        legendColors: ['#D6E685', '#1E6823']
      });


      if (false) {
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
