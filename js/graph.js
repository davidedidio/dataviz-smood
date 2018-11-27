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
             .map((x) => parseInt(x))
}

function remove_element_from_array(array, element){
	let index = array.indexOf(element);
	if (index > -1) {
  	array.splice(index, 1);
	}
}

var link_map;
class Graph {

	constructor(data) {
		this.nodes = this.build_nodes(data)//.slice(0, 1000);
		this.links = this.build_links(data)//.slice(0, 1000);

		console.log(this.nodes);
		console.log(this.links);

		link_map = {};

		for(let n of this.nodes){
			link_map[n.id] = {};
		}

		for(let l of this.links){
			if (link_map[l.source][l.target] == undefined){
				link_map[l.source][l.target] = 1;
			}else{
				link_map[l.source][l.target]++
			}
			if (link_map[l.target][l.source] == undefined){
				link_map[l.target][l.source] = 1;
			}else{
				link_map[l.target][l.source]++
			}
		}

		let has_work = true;
		while(has_work){
			console.log(Object.keys(link_map).length)
			has_work = false;

			for(let s in link_map){
				if(Object.keys(link_map[s]).length == 2){
					let obj = link_map[s];
					let keys = Object.keys(obj);

					if(link_map[keys[0]] != undefined && link_map[keys[1]] != undefined){
						has_work = true;

						link_map[keys[0]][keys[1]] = link_map[keys[1]][s];
						link_map[keys[1]][keys[0]] = link_map[keys[0]][s];

						delete link_map[keys[0]][s];
						delete link_map[keys[1]][s];

						delete link_map[s];
					}
				}
			}
		}

		this.nodes = Object.keys(link_map).map((x) => ({"id":parseInt(x)}) );
		this.links = []
		Object.keys(link_map).forEach( (x) => Object.keys(link_map[x]).forEach( (y) => this.links.push( {"source": parseInt(x), "target": parseInt(y), "num": link_map[x][y]} ) ) )


		console.log(link_map);

		this.build_simulation()
	}



	build_simulation(){
		  this.simulation = d3.forceSimulation(this.nodes)
		      .force("link", d3.forceLink(this.links).id(d => d.id))
		      .force("charge", d3.forceManyBody())
		      .force("x", d3.forceX(width / 2))
		      .force("y", d3.forceY(height / 2))
		      .on("tick", () => ticked(this.nodes, this.links));

		  this.simulation.force("x").strength(0.2);
		  this.simulation.force("y").strength(0.2);

		  d3.select(canvas)
			    .on("mousemove", mousemoved)
			    .call(d3.drag()
			        .container(canvas)
			        .subject(dragsubject)
			        .on("start", dragstarted)
			        .on("drag", dragged)
			        .on("end", dragended));
	}

	build_links(data){
		let links = new Array();

	  for (let d of data) {
	    let previous = null;
	    for (var i = 0; i < d.road.length; i++) {
	      let current = d.road[i];
	      if(previous != null){
	        let l = {"source": previous, "target": current}
	        links.push(l);
	      }
	      previous = current;
	    }
	  }

		return links
	}

	build_nodes(data){
		let nodes_idx = new Set();
	  data.forEach((d) => d.road.forEach(n => nodes_idx.add(n)))

	  let nodes = new Array();
	  nodes_idx.forEach((idx) => nodes.push({"id":idx}));

		return nodes;
	}

}

var canvas;
var context;
var width;
var height;
var searchRadius;

whenDocumentLoaded(() => {

  canvas = document.querySelector("canvas"),
  context = canvas.getContext("2d"),
  width = canvas.width,
  height = canvas.height,
  searchRadius = 20;

  d3.csv(URL_FULL + BASE_URL + "/data/dataviz_lat_lon.csv",
    function(d) {
      return {
          plat : d.plat,
          plng : d.plng,
          dlat : d.dlat,
          dlng : d.dlng,
          time : d.t,
          road : parse_csv_list(d.road)
        };
    }).then(function(data) {
      graph = new Graph(data);
    },);

});

function ticked(nodes, links) {
  context.clearRect(0, 0, width, height);
  links.forEach(drawLink);


  context.beginPath();
  nodes.forEach(drawNode);
  context.fill();
}

function drawLink(d) {
		context.beginPath();
		//context.lineCap="round";
		context.lineWidth = Math.log(d.num);
    context.moveTo(d.source.x, d.source.y);
		context.lineTo(d.target.x, d.target.y);
		context.strokeStyle = "#222";
	  context.stroke();
}

function drawNode(d) {
    context.moveTo(d.x, d.y);
    context.arc(d.x, d.y, 8, 0, 2 * Math.PI);
}

function dragstarted() {
    if (!d3.event.active) graph.simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
}

function dragended() {
    if (!d3.event.active) graph.simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
}

function dragsubject() {
    return graph.simulation.find(d3.event.x, d3.event.y, searchRadius);
}

function mousemoved() {
    var a = this.parentNode,
    	m = d3.mouse(this),
    	d = graph.simulation.find(m[0], m[1], searchRadius);
}
