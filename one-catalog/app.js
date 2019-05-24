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

     var sunburst_data = transmogrify2(catalog);
     console.log(sunburst_data);
   
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
}
})



function nested_groupby(data, fields) {
  
}
/*
[
  {
    "aperture": "2",
    "camera": "Canon PowerShot G9 X Mark II",
    "count": "115",
    "focal_length": "10.2",
    "id": "997",
    "lens": "10.2-30.6 mm"
  },
  {
    "aperture": "2.3",
    "camera": "Canon PowerShot G9 X Mark II",
    "count": "72",
    "focal_length": "10.2",
    "id": "39412",
    "lens": "10.2-30.6 mm"
  },
  etc...
]
*/

class SunburstData {
  constructor(label, data, groupby) {
    this.chart = null
    this.name = label
    this.data = data
    this.size = data.reduce((sum, record) => sum + parseInt(record.count), 0)

    if (Array.isArray(groupby) && groupby.length) {
      // Group the data by the first field in the group by list
      let field = groupby[0]
      let groups_tmp = data.reduce((map, record) => {        
        let key = record[field]
        let group = map[key]
        if (!group) {
          group = {
            name: key,
            data: []
          }
          map[key] = group
        }
        group.data.push(record)
        return map
      }, {})

      // Flatten the groups into a list and recurse
      let groups = Object.keys(groups_tmp).map((k) => groups_tmp[k])
      this.children = groups.map(group => new SunburstData(group.name, group.data, groupby.slice(1)))
    }
  }

  render(selector) {
    let data = this
    nv.addGraph(function() {
      data.chart = nv.models.sunburstChart()
      data.chart.color(d3.scale.category20c())
      d3.select(selector)
        .datum([data])
        .call(data.chart)
      nv.utils.windowResize(data.chart.update)
      return data.chart
    })
  }
}

$.ajax({
  url: 'sunburst.json',
  dataType: 'json',
  
  success: function(data) {

    let sunburst_configs = [
      { id: '#sunburst1', group_by: ['camera', 'lens', 'aperture'] },
      { id: '#sunburst2', group_by: ['aperture', 'exposure'] },
      { id: '#sunburst3', group_by: ['lens', 'exposure', 'aperture'] }
    ]

    for (let config of sunburst_configs) {
      let root = new SunburstData('All', data, config.group_by)
      root.render(config.id)
    }
  }
})
