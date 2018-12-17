function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

function get_distance(plat, plng, dlat, dlng){

}

function get_time(string){
	return parseInt(string.substring(0,2),10);
}
function show_histogram(data){
  let times_ = new Array()
  data.map(function(i){
    times_.push(get_time(i.time));

	})
  build_histogram_deliveries(times_);

	let distances;
	try{
		distances = new Map();
	}catch(e){
		distances = Map();
	}

	data.map(function(i){
			let hour = get_time(i.time);
			if (distances.has(hour)){
				distances.set(hour, distances.get(hour) + parseInt(i.distance,10));
			}
			else{
				distances.set(hour,parseInt(i.distance,10));
			}
		})
	console.log(distances);

	build_histogram(distances);
	}

	function build_histogram(dict){
	    // set the dimensions and margins of the graph
	 		let margin = {top: 10, right: 30, bottom: 30, left: 60};
	    let width = 300 - margin.left - margin.right;
	    let height = 200 - margin.top - margin.bottom;

	    // set the ranges
	    var x = d3.scaleLinear()
	              .domain([0, 24])
	              .range([0,width]);

	    // set the parameters for the histogram
	 /*   var histogram = d3.histogram()
	    .value(function(d,i) { return i; })
	    .domain(x.domain())
	    .thresholds(x.ticks(24))(dict);*/
			let histogram = dict;


	    let yMax = 0;
			let yMin=dict.get(10);

			for(value of dict.values()){
				if(value>yMax){yMax = value;}
				if (value<yMin){yMin = value};
			}

			/*d3.max(histogram, function(d,i){
				console.log(d);
				console.log(i);
				return i});
	    var yMin = d3.min(histogram, function(d){return histogram.get(d)});
*/
			console.log(yMax);

	    var y = d3.scaleLinear()
	            .domain([0, yMax])
	            .range([height, 0]);

	    var xAxis = d3.axisBottom(x);

	    var svg = d3.select("#distances").append("svg")
	                    .attr("width", width + margin.left + margin.right)
	                    .attr("height", height + margin.top + margin.bottom)
	                  .append("g")
	                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			dict.forEach(function(value,key){
				console.log(value);
				svg.append("rect")
								.attr("class","bar")
								.attr("fill","white")
								.attr("x",1)
								.attr("transform",
								"translate(" + x(key) + "," + y(value) + ")")
		      .attr("width", width/24)//(x(times[0].dx) - x(0)) - 1)
		      .attr("height",height - y(value));
			});
				// add the x Axis
	svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

			// add the y Axis
	  svg.append("g")
	      .call(d3.axisLeft(y));

	}

  function build_histogram_deliveries(times){
    // set the dimensions and margins of the graph
 		var margin = {top: 10, right: 30, bottom: 30, left: 40};
    let width = 300 - margin.left - margin.right;
    let height = 200 - margin.top - margin.bottom;


    // set the ranges
    var x = d3.scaleLinear()
              .domain([0, 24])
              .range([0,width]);


    // set the parameters for the histogram
    var histogram = d3.histogram()
    .value(function(d) { return d; })
    .domain(x.domain())
    .thresholds(x.ticks(24))(times);
      //  .bins(x.ticks(24))
			console.log(histogram);

    var yMax = d3.max(histogram, function(d){return d.length});
    var yMin = d3.min(histogram, function(d){return d.length});

    var y = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0]);

    var xAxis = d3.axisBottom(x);

//    console.log(width + margin.left + margin.right)
    var svg = d3.select("#hist").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.selectAll("rect")
					.data(histogram).enter().append("rect")
						.attr("class","bar")
						.attr("fill","white")
						.attr("x",1)
						.attr("transform", function(d) {
		  return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
      .attr("width", width/24)//(x(times[0].dx) - x(0)) - 1)
      .attr("height", function(d) { return height - y(d.length); });

			// add the x Axis
svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

		// add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

  /**var bar = svg.selectAll(".bar")
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
        .attr("width", (x(times[0].dx) - x(0)) - 1)
        .attr("height", function(d) { return height - y(d.y); })
        .attr("fill", function(d) { return colorScale(d.y) });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);*/

    }


function parse_csv_list(data){
  return data.slice(1, -1)
             .replace(/'/g, "")
             .split(",")
             .map((x) => parseFloat(x))
}

whenDocumentLoaded(() => {

	document.getElementById("hist").style.color = "white";
  data = 0;

  d3.csv(URL_FULL + BASE_URL + "/data/dataviz_lat_lon.csv",
    function(d) {
      return {
          plat : d.plat,
          plng : d.plng,
          dlat : d.dlat,
          dlng : d.dlng,
          time : d.t,
					distance : d.distance,
          //road : d.road,
          road_lat : parse_csv_list(d.road_latitudes),
          road_lng : parse_csv_list(d.road_longitudes)
        };
    }).then(function(data) {
      this.data = data
	  show_histogram(data);

    },);

});
