function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

function show_histogram(data){
  let times_ = new Array()
  data.map(function(i){
    times_.push(parseInt(i.time.substring(0,2),10))
  build_histogram(times_);
})
    console.log(times_)
  }

  function build_histogram(times){
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    // set the ranges
    var x = d3.scaleLinear()
              .domain([0, 24])
              .range([0,width]);


    // set the parameters for the histogram
    var histogram = d3.histogram()(times);

      //  .bins(x.ticks(24))


    var yMax = d3.max(histogram, function(d){return d.length});
    var yMin = d3.min(histogram, function(d){return d.length});

    var y = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0]);

    var xAxis = d3.axisBottom(x);

    var svg = d3.select("#insights-sidebar").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
                        .data(data)
                      .enter().append("g")
                        .attr("class", "bar")
                        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    let color = "blue"

    var colorScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

    bar.append("rect")
        .attr("x", 1)
        .attr("width", (x(values[0].dx) - x(0)) - 1)
        .attr("height", function(d) { return height - y(d.y); })
        .attr("fill", function(d) { return colorScale(d.y) });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    }


function parse_csv_list(data){
  return data.slice(1, -1)
             .replace(/'/g, "")
             .split(",")
             .map((x) => parseFloat(x))
}

whenDocumentLoaded(() => {

  data = 0;

  d3.csv(URL_FULL + BASE_URL + "/data/dataviz_lat_lon.csv",
    function(d) {
      return {
          plat : d.plat,
          plng : d.plng,
          dlat : d.dlat,
          dlng : d.dlng,
          time : d.t,
          //road : d.road,
          road_lat : parse_csv_list(d.road_latitudes),
          road_lng : parse_csv_list(d.road_longitudes)
        };
    }).then(function(data) {
      this.data = data
	  show_histogram(data);

    },);

});
