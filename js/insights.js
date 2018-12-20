function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

function parse_csv_list(data){
  return data.slice(1, -1)
             .replace(/'/g, "")
             .split(",")
             .map((x) => parseFloat(x))
}

function parseTime(time){
	let split = time.split(':');
	let time_parsed = parseInt(split[0])+parseInt(split[1])/60
	return time_parsed
}

class Histogram{
	constructor(data, id, xLabel, yLabel){
		this.data = data
		this.id = id
		this.xLabel = xLabel
		this.yLabel = yLabel

		this.x_min = Math.floor(d3.min(data, d => d))
		this.x_max = Math.ceil(d3.max(data, d => d))

		this.build()
	}

	build(){
	 	let margin = {top: 7, right: 10, bottom: 25, left: 32};
	    this.width = 280 - margin.left - margin.right;
	    this.height = 198 - margin.top - margin.bottom;

		this.svg = d3.select(this.id).append("svg")
						.attr("class","histograms")
	                    .attr("width", this.width + margin.left + margin.right)
	                    .attr("height", this.height + margin.top + margin.bottom)
	                  .append("g")
	                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		this.x = d3.scaleLinear()
		    .domain(d3.extent(this.data)).nice()
		    .range([margin.left, this.width - margin.right])
		
		this.y = d3.scaleLinear()
			.range([this.height - margin.bottom, margin.top])

		this.xAxis = g => g
			.attr("transform", "translate(0," + (this.height - margin.bottom) + ")")
			.call(d3.axisBottom(this.x).tickSizeOuter(0)
            .ticks(5));

		this.yAxis = g => g
			.attr("transform", "translate(" + margin.left + ",0)")
			.call(d3.axisLeft(this.y)
			.ticks(5));

		this.svg.append("g")
			.attr("class", "x-axis")

		this.svg.append("g")
			.attr("class", "y-axis")

		let label_color = 'rgba(255,255,255,.8)'
		// text label for the x axis
		this.svg.append("text")
		       .attr("transform",
		             "translate(" + (this.width/2) + " ," +
		                            (this.height + margin.top) + ")")
		       .style("text-anchor", "middle")
				.style("fill", label_color)
				.style("font-size", "0.9em")
		       .text(this.xLabel);


		// text label for the y axis
		this.svg.append("text")
	       .attr("transform", "rotate(-90)")
	       .attr("y", 12 - margin.left)
	       .attr("x",10 - (this.height / 2))
	       .attr("dy", "1em")
	       .style("text-anchor", "middle")
			 .style("fill", label_color)
			 .style("font-size", "0.9em")
	       .text(this.yLabel);

		this.update(this.data, 0)
	}

	update(new_data, speed = 1000){
		// console.log('update', this.id)
		let bins = d3.histogram()
	    .domain(this.x.domain())
	    .thresholds(this.x.ticks(30))
	  	(new_data)

	  	this.y.domain([0, d3.max(bins, d => d.length)]).nice()

		this.svg.selectAll(".y-axis").transition().duration(speed)
			.call(this.yAxis);

		this.x.domain([this.x_min, this.x_max]).nice()

		this.svg.selectAll(".x-axis").transition().duration(speed)
			.call(this.xAxis)

	  	var bar = this.svg.selectAll(".bar")
			.data(bins, d => d.length)

		bar.exit().remove();

		bar.enter().append("rect")
			.attr("class", "bar")
			.attr("fill", "rgb(184,62,77)")
			.attr("width", d => Math.max(0, this.x(d.x1) - this.x(d.x0) - 1))//this.x.bandwidth()
			.attr("x", d => this.x(d.x0) + 1)
			.attr("y", d => this.y(0))
			.attr("height", d => 0)
			.merge(bar)
		.transition().duration(speed)
			.attr("x", d => this.x(d.x0) + 1)
			.attr("y", d => this.y(d.length))
			.attr("height", d => this.y(0) - this.y(d.length))

		// bar.exit()
  //       .transition()
  //       .duration(speed)
  //       .attr('height', 0)
  //       .attr('y', this.height)
  //       .remove();
	}
}

class Insights{
	constructor(data){
		this.data = data;
		this.build_histograms(this.data);
	}

	update(ids){
		let new_data = this.data.filter((d,i)=>ids.includes(i));
		this.update_histograms(new_data);
	}

	build_histograms(data){
		let time_data = data.map(d => parseTime(d.time));
		this.time_hist = new Histogram(time_data, "#time-hist", "Time of the day", "Number of deliveries");

		let dist_data = data.map(d => d.distance/1000);
		this.distance_hist = new Histogram(dist_data, "#distance-hist", "Distance (km)", "Number of deliveries");

		let dur_data = data.map(d => d.duration/60);
		this.duration_hist = new Histogram(dur_data, "#duration-hist", "Duration (minutes)", "Number of deliveries");
	}

	update_histograms(new_data){
		let time_data = new_data.map(d => parseTime(d.time));
		this.time_hist.update(time_data);

		let dist_data = new_data.map(d => d.distance/1000);
		this.distance_hist.update(dist_data);

		let dur_data = new_data.map(d => d.duration/60);
		this.duration_hist.update(dur_data);
	}
}


whenDocumentLoaded(() => {

  d3.csv(URL_FULL + BASE_URL + "/data/dataviz_lat_lon.csv",
    function(d) {
      return {
          	time : d.t,
			distance : parseFloat(d.distance),
			duration : parseFloat(d.duration)
        };
    }).then(function(data) {
			insights = new Insights(data);

			d3.csv(URL_FULL + BASE_URL + "/data/heatmap_data.csv",
				function(d) {
					return {
							lat1 : d.lat1,
							lon1 : d.lon1,
							lat2 : d.lat2,
							lon2 : d.lon2,
							heat : d.heat,
							id	 : parse_csv_list(d.id)
						};
				}).then(function(data) {
					heatmap = new HeatMap(data)
					story = new Story();

					d3.csv(URL_FULL + BASE_URL + "/data/restaurants.csv",
						function(d) {
							return {
									plat : d.plat,
									plng : d.plng,
									road_ids: parse_csv_list(d.paths_ids)
								};
						}).then(function(data) {
							heatmap.r_data = data
							heatmap.update_map();
						},);
						d3.csv(URL_FULL + BASE_URL + "/data/time_data.csv",
							function(d) {
								return {
										time : d.time,
										ids : parse_csv_list(d.indices)
									};
							}).then(function(data) {
								clock = new Clock(data)
								clock.setCaptions("all");
							},);

				},);
    },);

});
