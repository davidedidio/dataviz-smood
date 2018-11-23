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

	let couples = []
	let colore=[];

	for (var i=0; i<data.length; i++){
		let lats = data[i].road_lat;
		let lngs = data[i].road_lng;

    console.log(lats);

		/*let r = Math.floor(Math.random() * 255);
		let g = Math.floor(Math.random() * 255);
		let b = Math.floor(Math.random() * 255);

		colore.append("rgb("+r+" ,"+g+","+ b+")"); */

		ccc = lats.map(function(e, j) {
	     return [e, lngs[j]];
		});

    console.log(ccc);

    let polyline = L.polyline(ccc, {color: 'red'});
    polyline.addTo(mymap);

    console.log(i);
	}
}


function onMapClick(e) {
    L.popup().setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

var mymap;

whenDocumentLoaded(() => {

  mymap = L.map('mapid',{
		 trackResize: false
	  }).setView([46.519962, 6.64], 15);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 30,
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoiZmF0aW5lYiIsImEiOiJjam9tM3ZvcnIwdWc4M3Nwanh6YmkzdHlvIn0.sRywCdS4xkc_JDogD-kAZA'
	}).addTo(mymap);

  mymap.on('click', onMapClick);

  d3.csv("../data/dataviz_lat_lon.csv",
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
      show_roads(data);
    },);

});
