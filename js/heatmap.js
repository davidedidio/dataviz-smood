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
	let road_ids = this.options["road_ids"];
	//console.log(road_ids);
	heatmap.set_road_ids(road_ids);
	heatmap.set_selected_restaurants([]);
	heatmap.update_map();
	L.DomEvent.stopPropagation(e);
}

function on_rest_click(e){
	let road_ids = this.options["road_ids"];
	let rest_id = this.options["rest_id"];

	heatmap.set_road_ids(road_ids);
	heatmap.set_selected_restaurants([rest_id]);
	heatmap.update_map();
	L.DomEvent.stopPropagation(e);
}

function on_map_click(e){
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

		this.update_map();
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

	update_map(){
		this.old_layer = this.layer
		this.layer = L.canvas({ padding: 0.5});
		this.old_lines = this.lines;
		this.lines=[];

		this.show_roads()
		this.show_restaurants()

		this.layer._container.style.opacity = 0;
		// This assignement is required for smooth animation (We need a closure in the animate function)
		let old_line = this.old_lines;
		let old_layer = this.old_layer;
		let old_rest_markers_group = this.old_rest_markers_group;
		if(this.old_layer != undefined){
			$(this.old_layer._container).animate({ opacity: 0 }, 2000, () => {
				old_line.forEach((l) => l.remove())
				old_layer.remove();
				this.mymap.removeLayer(old_rest_markers_group);
			});
		}

		$(this.layer._container).animate({ opacity: 1 }, 2000, () => {});
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



});
