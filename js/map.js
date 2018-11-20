function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {

  data = [{road_lat: [46.1, 46.2, 46.2, 46.3], road_lng:[6.1, 6.2, 6.2, 6.1]},
          {road_lat: [46.1, 46.2, 46.2, 46.3], road_lng:[6.2, 6.4, 6.4, 6.2]},
          {road_lat: [46.1, 46.2, 46.2, 46.3], road_lng:[6.3, 6.4, 6.5, 6.3]},
          {road_lat: [46.1, 46.2, 46.2, 46.3], road_lng:[6.3, 6.4, 6.6, 6.1]}]

  d3.csv("../data/dataviz_lat_lon.csv",
    function(data) {
      console.log(data);
    },
    function(d) {
      return {
          plat : d.plat,
          plng : d.plng,
          dlat : d.dlat,
          dlng : d.dlng,
          time : d.t,
          road : d.road,
          road_lat : d.road_latitudes,
          road_lng : d.road_longitudes
        };
    });

});
