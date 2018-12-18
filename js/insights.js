function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

function get_time(string){
	return parseInt(string.substring(0,2),10);
}

function get_max_min_values(dict){
	mini = dict.values().next().value;
	maxi = dict.values().next().value;

	for(value of dict.values()){
		if(value>maxi){maxi = value;}
		if (value<mini){mini = value};
	}
	return [mini,maxi]
}


function get_max_min_keys(dict){
	mini = dict.keys().next().value;
	maxi = dict.keys().next().value;

	for(value of dict.keys()){
		if(value>maxi){maxi = value;}
		if (value<mini){mini = value};
	}
	return [mini,maxi]
}

class Insights{
	constructor(data){
		this.data = data;
		this.show_histograms(this.data);
	}

	update(ids){
		let new_data = this.data.filter((d,i)=>ids.includes(i));
		this.show_histograms(new_data);
	}

	show_histograms(data){
		console.log(data);
		d3.selectAll(".histograms").remove();

		let x1 = document.getElementById("title1");
		x1.style.display = "none";

		let x2 = document.getElementById("title2");
		x2.style.display = "none";
		let x3 = document.getElementById("title3");
		x3.style.display = "none";


		let times
		try{
			times = new Map();
		}catch(e){
			times = Map();
		}

		let distances;
		try{
			distances = new Map();
		}catch(e){
			distances = Map();
		}

		let distanceMax = Math.max.apply(Math, this.data.map(function(o) { return o.distance; }))/1000;
		let distanceMin = Math.min.apply(Math, this.data.map(function(o) { return o.distance; }))/1000;
		let step = Math.floor((distanceMax-distanceMin)/12);
		let rangeDist = Array(Math.floor(distanceMax/step+1)).fill().map((x,i)=>i*step);

		let durations;
		try{
			durations = new Map();
		}catch(e){
			durations = Map();
		}

		let durationMax = Math.max.apply(Math, this.data.map(function(o) { return o.duration; }))/60;
		let durationMin = Math.min.apply(Math, this.data.map(function(o) { return o.duration; }))/60;
		let stepDur = Math.floor((durationMax-durationMin)/12);
		let rangeDur = Array(Math.floor(durationMax/step+1)).fill().map((x,i)=>i*step);


		data.map(function(i){
				let hour = get_time(i.time);
				//get the distance in kilometers
				let dist = parseInt(i.distance,10)/1000;
				let duration = parseInt(i.duration,10)/60;

				if (times.has(hour)){
						times.set(hour, times.get(hour) + 1);
				}
				else{
						times.set(hour,1);
					}

				rangeDist.map(function(j){
					if(dist>=j && dist<j+step){
						if (distances.has(j)){
							distances.set(j, distances.get(j) + 1);
						}
						else{
							distances.set(j,1);
						}
					}
				});

				rangeDur.map(function(j){
					if(duration>=j && duration<j+stepDur){
						if (durations.has(j)){
							durations.set(j, durations.get(j) + 1);
						}
						else{
							durations.set(j,1);
						}
					}
				});



			});
		this.build_histogram(times, "#hist", "Hours", "Number of trips", "title1");
		this.build_histogram(distances,"#distances", "Distance in kms", "Number of trips", "title2");
		this.build_histogram(durations, "#durations", "Duration in minutes", "Number of trips", "title3");

	}

		build_histogram(dict, id, xLabel, yLabel, title){
		    // set the dimensions and margins of the graph
		 		let margin = {top: 10, right: 30, bottom: 30, left: 60};
		    let width = 300 - margin.left - margin.right;
		    let height = 200 - margin.top - margin.bottom;

				let [yMin,yMax] = get_max_min_values(dict);
				let [xMin,xMax] = get_max_min_keys(dict);
				if(xMin!=xMax){


			    // set the ranges
			    var x = d3.scaleLinear()
			              .domain([xMin, xMax])
			              .range([0,width-width/(xMax+1-xMin)]);

			    // set the parameters for the histogram

					let histogram = dict;

			    var y = d3.scaleLinear()
			            .domain([0, yMax])
			            .range([height, 0]);

			    var xAxis = d3.axisBottom(d3.scaleLinear()
			              .domain([xMin, xMax])
			              .range([0,width]));

			    var svg = d3.select(id).append("svg")
												.attr("class","histograms")
			                    .attr("width", width + margin.left + margin.right)
			                    .attr("height", height + margin.top + margin.bottom)
			                  .append("g")
			                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					dict.forEach(function(value,key){
						svg.append("rect")
										.attr("class","bar")
										.attr("fill","white")
										.attr("stroke","gray")
										.attr("x",1)
										.attr("transform",
										"translate(" + x(key)+ "," + y(value) + ")")
				      .attr("width", width/(xMax+1-xMin))
				      .attr("height",height - y(value));
					});
				// add the x Axis
				svg.append("g")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis);

				svg.append("text")
		       .attr("transform",
		             "translate(" + (width/2) + " ," +
		                            (height + margin.top + 20) + ")")
		       .style("text-anchor", "middle")
					 .style("fill", "white")
		       .text(xLabel);


				// add the y Axis
			  svg.append("g")
			      .call(d3.axisLeft(y));

				// text label for the y axis
			   svg.append("text")
			       .attr("transform", "rotate(-90)")
			       .attr("y", 0 - margin.left)
			       .attr("x",0 - (height / 2))
			       .attr("dy", "1em")
			       .style("text-anchor", "middle")
						 .style("fill", "white")
			       .text(yLabel);

				 let titleDiv = document.getElementById(title);
				  titleDiv.style.display = "block";
			 }
		}

	 /* function build_histogram_deliveries(times){
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

	    var yMax = d3.max(histogram, function(d){return d.length});
	    var yMin = d3.min(histogram, function(d){return d.length});

	    var y = d3.scaleLinear()
	            .domain([0, yMax])
	            .range([height, 0]);

	    var xAxis = d3.axisBottom(x);

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
	    }*/
		}


function parse_csv_list(data){
  return data.slice(1, -1)
             .replace(/'/g, "")
             .split(",")
             .map((x) => parseFloat(x))
}

whenDocumentLoaded(() => {

	document.getElementById("hist").style.color = "white";

  d3.csv(URL_FULL + BASE_URL + "/data/dataviz_lat_lon.csv",
    function(d) {
      return {
          time : d.t,
					distance : d.distance,
					duration : d.duration,
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
