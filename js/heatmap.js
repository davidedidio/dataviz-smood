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

function on_polyline_click(e){
	story.close_start_button();
	let road_ids = this.options["road_ids"];
	// console.log(road_ids);
	heatmap.set_road_ids(road_ids);
	heatmap.set_selected_restaurants([]);
	heatmap.update_map();
	L.DomEvent.stopPropagation(e);
}

function on_rest_click(e){
	story.close_start_button();
	let road_ids = this.options["road_ids"];
	let rest_id = this.options["rest_id"];
	// console.log([rest_id], road_ids);
	heatmap.set_road_ids(road_ids);
	heatmap.set_selected_restaurants([rest_id]);
	heatmap.update_map();
	L.DomEvent.stopPropagation(e);
}

function on_map_click(e){
	story.close_start_button();
	// console.log(e.latlng.lat, e.latlng.lng);
	// Reset selected paths and show everything
	heatmap.set_road_ids([...Array(2000).keys()]);
	heatmap.set_selected_restaurants([]);
	heatmap.update_map();
}

function intersect_arrays(array1, array2){
	return array1.filter((i) => array2.indexOf(i) !== -1);
}

class HeatMap {
	constructor(data){
		this.data = data;
		this.show_rest = true;
		this.rest_markers_group = null;

		this.tile_url = 'https://api.mapbox.com/styles/v1/mapbox/STYLE-v9/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}'
		this.style = 'dark';
		$('body').addClass('map-style-'+this.style)

		this.tiles = L.tileLayer(this.tile_url.replace('STYLE', this.style), {
			edgeBufferTiles: 2,
			maxZoom: 19,
			accessToken: 'pk.eyJ1IjoiZmF0aW5lYiIsImEiOiJjam9tM3ZvcnIwdWc4M3Nwanh6YmkzdHlvIn0.sRywCdS4xkc_JDogD-kAZA',
			retina: '@2x',
			detectRetina: true
		});

		this.create_color_legend()

		this.mymap = this.create_map();
		this.layer = L.canvas({ padding: 0.4 });
		this.lines = [];
		this.set_road_ids([...Array(2000).keys()]);
		this.set_time_ids([...Array(2000).keys()]);
		this.set_selected_restaurants([]);
	}

	set_map_style(new_style) {
		this.style = new_style;
		this.tiles.setUrl(this.tile_url.replace('STYLE', this.style));
		this.create_color_legend();
		this.update_map();
	}

	create_color_legend(){
		let scale;

		let svg = d3.select("#heatmap_legend")
		let text_color;
		if (this.style == 'dark'){
			scale = d3.scaleSequential((x) => d3.interpolateInferno(0.2 + 0.8 * x)).domain([0, 1000]);
			svg.style("color", "white")
			text_color = "white"
		}else{
			scale = d3.scaleSequential((x) => d3.interpolateYlOrRd(0.2 + 0.8 * x)).domain([0, 1000]);
			svg.style("color", "black")
			text_color = "black"
		}

		svg.selectAll("*").remove()

		let width = parseInt(svg.style("width"))-40;
		let height = parseInt(svg.style("height"));
		let barHeight = 20;

		let axisScale = d3.scalePow().exponent(0.5)
    	.domain(scale.domain())
    	.range([0, width])
		let axis = d3.axisLeft(this.axisScale);

		svg.append('g')
			 .append("rect")
				.attr("width", width)
				.attr("height", barHeight)
				.attr('transform', `translate(0, ${-barHeight})`)
				.style("fill", "url(#linear-gradient)");

	  svg.select('g').attr("class", `x-axis`)
	  .attr("transform", `translate(0,${height})`)
	  .call(d3.axisBottom(axisScale)
		.tickValues([0, 100, 200, 500, 1000])
	  	.ticks(width/40)
	    .tickSize(-barHeight))

		let linearGradient = svg.append("defs").append("linearGradient")
      .attr("id", "linear-gradient");
		linearGradient.selectAll("stop")
    	.data(axisScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: scale(t) })))
		  .enter().append("stop")
		  .attr("offset", d => d.offset)
		  .attr("stop-color", d => d.color);

		svg.select('g')
		 	.attr("transform", `translate(20, 40)`)
			.append('text')
				.attr("x", width / 2)
				.attr("y", 30)
				.attr("font-size", "1.5em")
				.style("text-anchor", "middle")
				.style("fill", text_color)
				.text("Nb. deliveries");

	}

	create_map() {
		let myCanvas = L.canvas({ padding: 0.4 });

		let mymap = L.map('mapid',{
			 trackResize: false,
			 renderer: myCanvas
		}).setView([46.526, 6.635], 13);

		this.tiles.addTo(mymap);
		mymap.on("click", on_map_click);

		return mymap
	}

	reset(){
		this.set_road_ids([...Array(2000).keys()]);
		this.set_time_ids([...Array(2000).keys()]);
		this.set_selected_restaurants([]);
		this.update_map();

		$('#navbar-msg').text('Showing all deliveries')
	}

	get_line_weight(zoom) {
		return Math.max(1,this.mymap.getZoom()- 11)
	}

	show_roads() {
		let highlight_lines = [];

		let heat = null;
		let filter_array = intersect_arrays(this.road_ids, this.time_ids);

		if (filter_array.length >= 2000){ // 2000 is the total number of paths
			// all paths are shown, we can use heat value from data
			heat = this.data.map(d => parseFloat(d.heat));
		} else {
			// we have to recompute heat for selected paths only
			heat = Array(this.data.length-1)
			for (var i=this.data.length-1; i>=0;i--){
				heat[i] = intersect_arrays(this.data[i].id, filter_array).length
			}
		}
		let max_value = 995//d3.max(heat)

		for (var i=this.data.length-1; i>=0;i--){
			let lat1=this.data[i].lat1;
			let lon1=this.data[i].lon1;
			let lat2=this.data[i].lat2;
			let lon2=this.data[i].lon2;
			let ids = this.data[i].id;

			let heat_index = Math.log(heat[i]+1)/Math.log(max_value+1);

			let color = null;
			let opacity = null;
			if (this.style=='dark') {
				color = d3.interpolateInferno(0.2+0.8*heat_index);
				opacity = 0.7 + 0.3*heat_index;
				if (heat_index == 0){
					opacity = 0.8;
					color = "rgb(30,30,30)"
				}
			} else if (this.style=='light') {
				color = d3.interpolateYlOrRd(0.2+0.8*heat_index);
				opacity = 0.7 + 0.3*heat_index;
				if (heat_index == 0){
					opacity = 0.7;
					color = "rgb(210,210,210)"
				}
			}

			let edge = [[lat1, lon1],[lat2, lon2]]

			let line= L.polyline(edge,{color: color,renderer: this.layer,opacity: opacity,weight:this.get_line_weight(this.mymap.getZoom()), road_ids: ids});
			line.on("click", on_polyline_click);
			if (heat_index > 0) {
				highlight_lines.push(line);
			}

			line.addTo(this.mymap);
			this.lines.push(line);
		}

		highlight_lines.map(line => line.bringToFront());

		this.mymap.on('zoomend', () => {
			let currentZoom = heatmap.mymap.getZoom();
			heatmap.lines.map(line => line.setStyle({weight:heatmap.get_line_weight(currentZoom)}));
		});
	}

	set_road_ids(road_ids){
		this.road_ids = road_ids;
	}

	set_selected_restaurants(selected_rests){
		this.selected_rests = selected_rests;
	}

	set_time_ids(time_ids){
		this.time_ids = time_ids;
	}

	update_navbar_msg(){
		let road_selected = (this.road_ids.length<2000);
		let rest_selected = (this.selected_rests.length>0);

		let time_selected = false
		let time = null
		let time_msg = ''
		if (window.clock!=undefined) {
			let vals = clock.slider.getValue();
	        time = vals.split(",");
	        let time_from = time[0]!="10:30";
	        let time_until = time[1]!="21:30";
	        let time_at = time[0]==time[1];
	        time_selected = (time_from || time_until);

	        time_msg = (time_at)? 'at'+time[0]: (time_from&&time_until)? 'between': (time_from)? 'from': 'until';
	        if (time_at){
	        	time_msg = 'at '+time[0];
	        }else if (time_from && time_until){
	        	time_msg = 'between '+time[0]+'-'+time[1];
	        }else if (time_from){
	        	time_msg = 'from '+time[0];
	        }else{
	        	time_msg = 'until '+time[1];
	        }
	        time_msg = ' '+time_msg;
		}
		
		if (!road_selected && !time_selected && !rest_selected) {
			$('#navbar-msg').text('Showing all deliveries');
		} 
		else if (road_selected && !rest_selected) {
			$('#navbar-msg').text('Showing deliveries through one road'+time_msg);
		}
		else if (!road_selected && !rest_selected) {
			$('#navbar-msg').text('Showing deliveries'+time_msg);
		}
		else if (road_selected && rest_selected) {
			$('#navbar-msg').text('Showing deliveries from one restaurant'+time_msg);
		}
	}

	update_map(){
		this.update_navbar_msg();
		this.old_layer = this.layer
		this.layer = L.canvas({ padding: 0.5});
		this.old_lines = this.lines;
		this.lines=[];

		insights.update(intersect_arrays(this.road_ids, this.time_ids));

		this.show_roads()
		this.show_restaurants()

		this.layer._container.style.opacity = 0;
		// This assignement is required for smooth animation (We need a closure in the animate function)
		let old_line = this.old_lines;
		let old_layer = this.old_layer;
		let old_rest_markers_group = this.old_rest_markers_group;
		if(this.old_layer != undefined){
			$(this.old_layer._container).animate({ opacity: 0 }, 800, () => {
				old_line.forEach((l) => l.remove())
				old_layer.remove();
				this.mymap.removeLayer(old_rest_markers_group);
			});
		}

		$(this.layer._container).animate({ opacity: 1 }, 800, () => {});
	}

	get_marker_radius(zoom) {
		return Math.max(1, this.mymap.getZoom()-11)
	}

	show_restaurants() {
		let markers = [];
		if (this.rest_markers_group != null) {
			this.old_rest_markers_group = this.rest_markers_group;
		}

		this.rest_markers_group = new L.FeatureGroup();
		for (var i=0; i< this.r_data.length;i++){
			let plat=this.r_data[i].plat;
			let plng=this.r_data[i].plng;
			let dlat=this.r_data[i].dlat;
			let dlng=this.r_data[i].dlng;
			let ids=this.r_data[i].road_ids;

			let r = this.get_marker_radius(this.mymap.getZoom());

			let color = null;
			let opacity = null;
			let is_selected =  (this.selected_rests.indexOf(i) >= 0)
			if (this.style=='dark') {
				if (is_selected){
					color = 'white';
					opacity = 1.0;
				} else {
					color = 'black';
					opacity = 0.9;
				}
			} else if (this.style=='light') {
				if (is_selected){
					color = 'black';
					opacity = 1.0;
				} else {
					color = 'rgb(110,110,110)';
					opacity = 0.9;
				}
			}

			plat = this.r_data[i].plat;
			plng = this.r_data[i].plng;
			let marker = L.circleMarker([plat,plng],{color:color,opacity:opacity,radius:r,renderer:this.layer, road_ids: ids, rest_id: i});//.addTo(this.mymap);
			marker.on("click", on_rest_click);

			this.rest_markers_group.addLayer(marker);
			markers.push(marker)

			if (this.show_rest){
				this.mymap.addLayer(this.rest_markers_group);
			}
		}

		this.mymap.on('zoomend', () => {
			let currentZoom = this.mymap.getZoom();
			markers.map(line => line.setStyle({radius:heatmap.get_marker_radius(currentZoom)}));
		});
	}
}

whenDocumentLoaded(() => {
	$("#nav_map").addClass("active")

    $('#map-style-dark').click(function() {
		$('body').removeClass('map-style-light')
		$('body').addClass('map-style-dark')

		heatmap.set_map_style('dark')
	});

	$('#map-style-light').click(function() {
		$('body').removeClass('map-style-dark')
		$('body').addClass('map-style-light')

		heatmap.set_map_style('light')
	});

	$('#rest-markers-check').click(function() {
		if(this.checked){
			heatmap.show_rest = true;
			heatmap.mymap.addLayer(heatmap.rest_markers_group)
		}else{
			heatmap.show_rest = false;
			heatmap.mymap.removeLayer(heatmap.rest_markers_group)
		}
	});

	$('#navbar-reset').click(function() {
		heatmap.reset()
	});


});
