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
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 30,
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoiZmF0aW5lYiIsImEiOiJjam9tM3ZvcnIwdWc4M3Nwanh6YmkzdHlvIn0.sRywCdS4xkc_JDogD-kAZA',
		detectRetina: true
	}).addTo(mymap);


	let couples = []
	let colore=[];
	let lines=[];


	for (var i=data.length-1; i>=0;i--){
		let lat1=data[i].lat1;
		let lon1=data[i].lon1;
		let lat2=data[i].lat2;
		let lon2=data[i].lon2;
		let heat=data[i].heat;

		let heat_index = Math.log(heat)/Math.log(995);
		let color = d3.interpolateOrRd(heat_index);
		//let color='blue';
		let opacity = 0.5 + 0.5*heat_index;

		let edge = [[lat1, lon1],[lat2, lon2]]

		let line= L.polyline(edge,{color: color,renderer: mymap.renderer,opacity: opacity,weight:Math.max(1,mymap.getZoom()-10)});
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
			lines.map(line => line.setStyle({weight:Math.max(1,mymap.getZoom()-10)}));
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
