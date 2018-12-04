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

	let myCanvas = L.canvas();

	let mymap = L.map('mapid',{
		 trackResize: false,
		 renderer: myCanvas
	}).setView([46.519962, 6.64], 15);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 30,
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoiZmF0aW5lYiIsImEiOiJjam9tM3ZvcnIwdWc4M3Nwanh6YmkzdHlvIn0.sRywCdS4xkc_JDogD-kAZA'
	}).addTo(mymap);


	let couples = []
	let colore=[];
	let lines=[];


	
//	let myCanvas = document.getElementById("myCanvas");
	//let myContex = myCanvas.getContext("2d");

	for (var i=0; i< data.length;i++){
		lats=data[i].road_lat;
		lngs=data[i].road_lng;

		lats=lats.filter(function(d){
			return !isNaN(d);
		})
		lngs=lngs.filter(function(d){
			return !isNaN(d);
		})
	/*	let r = Math.floor(Math.random() * 255);
		let g = Math.floor(Math.random() * 255);
		let b = Math.floor(Math.random() * 255);

		colore=("rgba("+r+" ,"+g+","+ b+")");*/
		colore='blue';
		let road=lats.map(function(e, j) {
			return [e, lngs[j]];
			});
		couples.push(road);
		let line= L.polyline(road,{color: colore,renderer: mymap.renderer,opacity: 0.05,weight:mymap.getZoom()-8});
		line.addTo(mymap);
		lines.push(line);
	
		plat = data[i].plat;
		plng = data[i].plng;
	//	L.circleMarker([plat,plng],{color:colore,radius:10,renderer:mymap.renderer}).addTo(mymap);

		dlat = data[i].dlat;
		dlng = data[i].dlng;
	//	L.circleMarker([dlat,dlng],{color:colore,radius:10,renderer:mymap.renderer}).addTo(mymap);

	}
	
		mymap.on('zoomend', function () {
			currentZoom = mymap.getZoom();
			lines.map(line => line.setStyle({weight: currentZoom-8}));
		});
		
	
	//let canevas = mymap.getRenderer();
	console.log(myCanvas.getContext());
		console.log("canvas");

//	let ctx = myCanvas.getContext();
//	ctx.drawImage(img, 0, 0);
	//img.style.display = 'none';
  	console.log("canvas");
/*
	let imageData = ctx.getImageData();//0, 0, myCanvas.width, myCanvas.height);
	console.log("canvas");
	
	let information = imageData.data;
	console.log("canvas");

	console.log(information);
	
	let coordinates = [].concat.apply([], couples);
	console.log(coordinates);
	let counts={}
	coordinates.map(x => counts[x] = 1);
	coordinates.map(x=>
		counts[x] = counts[x]+ 1);
		

	console.log("counts");
	console.log(counts);
	console.log(Object.keys(counts)[0].split(","));*/
}

whenDocumentLoaded(() => {

  data = 0;

  d3.csv(URL_FULL + BASE_URL + "/data/dataviz_lat_lon.csv",
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
      this.data = data
	  show_roads(data);

    },);

});
