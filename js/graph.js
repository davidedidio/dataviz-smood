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

var simulation;
var nodes;
var links;
function build_graph(data){

  let nodes_idx = new Set();
  data.forEach((d) => d.road.forEach(n => nodes_idx.add(n)))

  nodes = new Array();
  nodes_idx.forEach((idx) => nodes.push({"id":idx}));

  links = new Array();
  for (d of data) {
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

  nodes = nodes.slice(0, 1000);
  links = links.slice(0, 1000);

  simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX(width / 2))
      .force("y", d3.forceY(height / 2))
      .on("tick", ticked);

  simulation.force("x").strength(0.1);
  simulation.force("y").strength(0.1);

  d3.select(canvas)
	    .on("mousemove", mousemoved)
	    .call(d3.drag()
	        .container(canvas)
	        .subject(dragsubject)
	        .on("start", dragstarted)
	        .on("drag", dragged)
	        .on("end", dragended));


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

  d3.csv("../data/dataviz_lat_lon.csv",
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
      build_graph(data);
    },);

});

function ticked() {
  context.clearRect(0, 0, width, height);
  context.beginPath();
  links.forEach(drawLink);
  context.strokeStyle = "#222";
  context.stroke();

  context.beginPath();
  nodes.forEach(drawNode);
  context.fill();
}

function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
    context.moveTo(d.x, d.y);
    context.arc(d.x, d.y, 8, 0, 2 * Math.PI);
}

function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
}

function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
}

function dragsubject() {
    return simulation.find(d3.event.x, d3.event.y, searchRadius);
}

function mousemoved() {
    var a = this.parentNode,
    	m = d3.mouse(this),
    	d = simulation.find(m[0], m[1], searchRadius);

    console.log(m)
    console.log(d)
}
