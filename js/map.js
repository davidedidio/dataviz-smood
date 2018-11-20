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

      this.data = data

    },);

});
