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

function on_polyline_click(){
	let road_ids = this.options["road_ids"];
	heatmap.lines.forEach((l) => l.remove())
	heatmap.show_roads(road_ids)
}

class HeatMap {
	constructor(data){
		this.data = data;
		this.mymap = this.create_map();
		this.lines = []

		this.show_roads([...Array(2000).keys()]);
	}

	create_map() {
		let myCanvas = L.canvas();

		let mymap = L.map('mapid',{
			 trackResize: false,
			 renderer: myCanvas
		}).setView([46.526, 6.635], 13);

		L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}', {
			// attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 19,
			accessToken: 'pk.eyJ1IjoiZmF0aW5lYiIsImEiOiJjam9tM3ZvcnIwdWc4M3Nwanh6YmkzdHlvIn0.sRywCdS4xkc_JDogD-kAZA',
			retina: '@2x',
			detectRetina: true
		}).addTo(mymap);

		// L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
		// 	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
		// 	subdomains: 'abcd',
		// 	maxZoom: 19,
		// 	retina: '@2x',
		// 	detectRetina: true
		// }).addTo(mymap);
		return mymap
	}

	get_line_weight(zoom) {
		return Math.max(1,this.mymap.getZoom()-11)
	}

	show_roads(ids_to_show){
		let couples = []
		let colore=[];
		this.lines=[];
		let intersections = Array(this.data.length-1)

		for (var i=this.data.length-1; i>=0;i--){
			intersections[i] = this.data[i].id.filter((i) => ids_to_show.indexOf(i) !== -1).length
		}
		let max_value = d3.max(intersections)

		for (var i=this.data.length-1; i>=0;i--){
			let lat1=this.data[i].lat1;
			let lon1=this.data[i].lon1;
			let lat2=this.data[i].lat2;
			let lon2=this.data[i].lon2;
			//let heat=data[i].heat;
			let ids = this.data[i].id;

			let intersect_ids = intersections[i]

			let heat_index = Math.log(intersect_ids+1)/Math.log(max_value+1);
			let color = d3.interpolateInferno(0.2+0.8*heat_index);
			//let color = d3.interpolateCool(heat_index);

			let opacity = 0.7 + 0.3*heat_index;
			if (heat_index == 0){
				opacity = 0.8;
				color = "rgb(30,30,30)"
			}
			//let opacity = 1;

			let edge = [[lat1, lon1],[lat2, lon2]]

			let line= L.polyline(edge,{color: color,renderer: this.mymap.renderer,opacity: opacity,weight:this.get_line_weight(this.mymap.getZoom()), road_ids: ids});
			line.on("click", on_polyline_click);


			line.addTo(this.mymap);
			this.lines.push(line);

			// plat = data[i].plat;
			// plng = data[i].plng;
			// L.circleMarker([plat,plng],{color:colore,radius:10,renderer:mymap.renderer}).addTo(mymap);

			// dlat = data[i].dlat;
			// dlng = data[i].dlng;
			// L.circleMarker([dlat,dlng],{color:colore,radius:10,renderer:mymap.renderer}).addTo(mymap);
		}

		this.mymap.on('zoomend', () => {
			let currentZoom = heatmap.mymap.getZoom();
			console.log(currentZoom, heatmap.get_line_weight(currentZoom))
			heatmap.lines.map(line => line.setStyle({weight:heatmap.get_line_weight(currentZoom)}));
		});
	}

	get_marker_radius(zoom) {
		return Math.max(1, this.mymap.getZoom()-11)
	}

	show_restaurants(restaurant_data) {
		this.r_data = restaurant_data

		let markers = [];
		for (var i=0; i< this.r_data.length;i++){
			let plat=this.r_data[i].plat;
			let plng=this.r_data[i].plng;
			let dlat=this.r_data[i].dlat;
			let dlng=this.r_data[i].dlng;

			let r = this.get_marker_radius(this.mymap.getZoom());
			let color = 'black';
			let opacity = 0.9;

			plat = this.r_data[i].plat;
			plng = this.r_data[i].plng;
			let marker = L.circleMarker([plat,plng],{color:color,opacity:opacity,radius:r,renderer:this.mymap.renderer}).addTo(this.mymap);
			markers.push(marker)
		}

		this.mymap.on('zoomend', () => {
			let currentZoom = this.mymap.getZoom();
			markers.map(line => line.setStyle({radius:heatmap.get_marker_radius(currentZoom)}));
		});
	}
}

whenDocumentLoaded(() => {

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

			d3.csv(URL_FULL + BASE_URL + "/data/unique_pickups.csv",
		    function(d) {
		      return {
		          plat : d.plat,
		          plng : d.plang,
		        };
		    }).then(function(data) {
			  	heatmap.show_restaurants(data);
		    },);

    },);


});
