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

function show_roads(data){
	let myCanvas = L.canvas();

	let mymap = L.map('mapid',{
		 trackResize: false,
		 renderer: myCanvas
	}).setView([46.519962, 6.64], 15);

	L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}', {
		// attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
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


	let couples = []
	let colore=[];
	let lines=[];

	function get_line_weight(zoom) {
		return Math.max(1,mymap.getZoom()-11)
	}

	for (var i=data.length-1; i>=0;i--){
		let lat1=data[i].lat1;
		let lon1=data[i].lon1;
		let lat2=data[i].lat2;
		let lon2=data[i].lon2;
		let heat=data[i].heat;

		let heat_index = Math.log(heat)/Math.log(995);
		let color = d3.interpolateInferno(0.2+0.8*heat_index);
		//let color='blue';
		
		let opacity = 0.5 + 0.5*heat_index;
		//let opacity = 1;

		let edge = [[lat1, lon1],[lat2, lon2]]

		let line= L.polyline(edge,{color: color,renderer: mymap.renderer,opacity: opacity,weight:get_line_weight(mymap.getZoom())});
		line.addTo(mymap);
		lines.push(line);
	
		// plat = data[i].plat;
		// plng = data[i].plng;
		// L.circleMarker([plat,plng],{color:colore,radius:10,renderer:mymap.renderer}).addTo(mymap);

		// dlat = data[i].dlat;
		// dlng = data[i].dlng;
		// L.circleMarker([dlat,dlng],{color:colore,radius:10,renderer:mymap.renderer}).addTo(mymap);
	}
	
		mymap.on('zoomend', function () {
			currentZoom = mymap.getZoom();
			console.log(currentZoom, get_line_weight(currentZoom))
			lines.map(line => line.setStyle({weight:get_line_weight(currentZoom)}));
		});
}

whenDocumentLoaded(() => {
  data = 0;

  d3.csv(URL_FULL + BASE_URL + "/data/heatmap_data.csv",
    function(d) {
      return {
          lat1 : d.lat1,
          lon1 : d.lon1,
          lat2 : d.lat2,
          lon2 : d.lon2,
          heat : d.heat,
        };
    }).then(function(data) {
      this.data = data
	  show_roads(data);

    },);
});
