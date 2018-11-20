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
		

/*	var data = [{road_lat: [46.5, 46.2, 46.8, 46.3], road_lng:[6, 6.5, 6.3, 6.1]},
			  {road_lat: [46.1, 46.2, 46.2, 46.3], road_lng:[6.2, 6.4, 6.4, 6.2]},
			  {road_lat: [46.1, 46.2, 46.2, 46.3], road_lng:[6.3, 6.4, 6.5, 6.3]},
			  {road_lat: [46.1, 46.2, 46.2, 46.3], road_lng:[6.3, 6.4, 6.6, 6.1]}]
*/
	
	let mymap = L.map('mapid',{
		 trackResize: false
	}).setView([46.519962, 6.64], 15);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 30,
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoiZmF0aW5lYiIsImEiOiJjam9tM3ZvcnIwdWc4M3Nwanh6YmkzdHlvIn0.sRywCdS4xkc_JDogD-kAZA'
	}).addTo(mymap);

			
	let couples = []
	let colore=[];

	for (var i=0; i< 20;i++){
		console.log(data[i]);
		lats=data[i].road_lat;
		lngs=data[i].road_lng;
		
		/*let r = Math.floor(Math.random() * 255);
		let g = Math.floor(Math.random() * 255);
		let b = Math.floor(Math.random() * 255);
		
		colore.append("rgb("+r+" ,"+g+","+ b+")"); */
		console.log(lats);
		console.log(lngs);
		
		couples.push(lats.map(function(e, j) {
			return [e, lngs[j]];
			}))
		
		

		
		//L.marker([couple.road_lat,couple.road_lng]).addTo(mymap);
	}
	console.log(couples);
	L.polyline(couples).addTo(mymap);
}

whenDocumentLoaded(() => {

  data = 0;

  
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

	  console.log(data);
      this.data = data
	  show_roads(data);

    },);

});
