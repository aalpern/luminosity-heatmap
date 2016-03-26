// -*- mode:typescript -*-

var tmpl = Handlebars.compile($('#template').html());

function render(id, catalog) {
  if (!catalog.photos || !catalog.photos.length) {
    console.log(`Skipping ${id} - no pics!`)
    return
  }

  $('#report .row').append(tmpl({
    id: id
  }))
  var sunburst_data = transmogrify2(catalog);
  var chart;

    nv.addGraph(function() {
      try {
        chart = nv.models.sunburstChart()
          .color(d3.scale.category20c())

        d3.select("#" + id)
          .datum(sunburst_data)
          .call(chart);
        nv.utils.windowResize(chart.update);
        return chart;
      } catch (e) {
        console.log(`Error rendering ${id}. ${e}`)
        console.log(sunburst_data)
        console.log(catalog)
      }
    })
}

$.ajax({
  url: 'data/catalogs.json',
  dataType: 'json',

  success: function(catlist) {
    catlist.sort()
    catlist.forEach(cat => {
      var id = cat.replace(/ /g, '-').replace('.json', '')
      $.ajax({
        url: `data/${cat}`,
        dataType: 'json',
        success: (catalog) => render(id, catalog)
      })
    })
  }
})
