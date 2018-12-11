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
var tst;

class Graph {

	constructor(data) {
		//data = data.slice(0,5);
		this.starting_nodes = new Set(data.map((d) => d.road[0]));
		this.ending_nodes = new Set(data.map((d) => d.road[d.road.length-1]));

		this.nodes = this.build_nodes(data);
		this.links = this.build_links(data);

		let link_map = {};

		for(let n of this.nodes){
			link_map[n.id] = {};
		}

		for(let l of this.links){
			if (link_map[l.source][l.target] == undefined){
				link_map[l.source][l.target] = 1;
			}else{
				link_map[l.source][l.target]++
			}
			/*if (link_map[l.target][l.source] == undefined){
				link_map[l.target][l.source] = 1;
			}else{
				link_map[l.target][l.source]++
			}*/
		}

		let has_work = true;
		while(has_work){
			has_work = false;

			for(let node_from in link_map){
				for(let node in link_map[node_from]){
					let to_keys = Object.keys(link_map[node])
					if(to_keys.length == 1) {
						let node_to = Object.keys(link_map[node])[0];
						if(link_map[node_from][node] == link_map[node][node_to] && link_map[node_to][node] == link_map[node][node_from]){
							has_work = true;
							link_map[node_from][node_to] = link_map[node_from][node];
							delete link_map[node_from][node];
							delete link_map[node][node_to];
							let a = 0;
						}
					}else if(to_keys.includes(node_from) && to_keys.length == 2){
						let node_to = to_keys[0];
						if (node_to == node_from){
							node_to = to_keys[1]
						}

						if(link_map[node_from][node] == link_map[node][node_to] && link_map[node_to][node] == link_map[node][node_from]){
							has_work = true;
							link_map[node_from][node_to] = link_map[node_from][node];
							delete link_map[node_from][node];
							delete link_map[node][node_to];

							link_map[node_to][node_from] = link_map[node_to][node];
							delete link_map[node_to][node];
							delete link_map[node][node_from];
							let a=0;
						}
					}
				}
			}
		}

		let node_to_keep = new Set();
		for(let node_from in link_map){
			for(let node_to in link_map[node_from]){
				if(link_map[node_from][node_to] > 0){
					node_to_keep.add(node_from)
					node_to_keep.add(node_to)
				}
			}
		}
		for(let node in link_map){
			if(!node_to_keep.has(node)){
				delete link_map[node]
			}
		}

		console.log(Object.keys(link_map).length)

		this.nodes = Object.keys(link_map)
			.map((x) => parseInt(x) )
			.map((x) => ({group: "nodes",
								   "data": {"id":x,
													  "starting_node": this.starting_nodes.has(x),
												    "ending_node": this.ending_nodes.has(x),
												    "position": nodes_pos_dict[x] }}));
		this.links = []
		Object.keys(link_map).forEach( (x) => Object.keys(link_map[x]).forEach( (y) => this.links.push(
			{group: "edges",
			 data: {"source": parseInt(x), "target": parseInt(y), "num": link_map[x][y]}} ) ) )

		tst = link_map
		this.build_simulation_cytoscape()
	}

	build_simulation_cytoscape(){
		let p_nodes_size = 40;
		let int_nodes_size = 20;
		let d_nodes_size = 30;

		cy = cytoscape({
			container: document.getElementById('cy'),
			style: [{	"selector": 'node',
								"style": {
									"background-color": function( ele ){return (ele.data('starting_node')) ? "#ff1a30" : (ele.data('ending_node') ? "#1aff85" : "black")},
									"width": function( ele ){return (ele.data('starting_node')) ? p_nodes_size : (ele.data('ending_node') ? d_nodes_size : int_nodes_size)},
									"height": function( ele ){return (ele.data('starting_node')) ? p_nodes_size : (ele.data('ending_node') ? d_nodes_size : int_nodes_size)},
									"opacity": "0.9"
								/*"label": function(ele){return ele.data("id")}*/
								}
							},{
								"selector": 'edge',
								"style": {
									"curve-style": "bezier",
									"width": function( ele ){ return 1.2*Math.pow(ele.data('num'), 1/2)},
									"line-color": "rgb(255,255,255)",
									"target-arrow-shape": "triangle",
									"target-arrow-color": "rgb(255,255,255)",
									"opacity": "0.66"
							}}],
			layout: {name: 'preset',
							 "positions": function(ele){return {"x":(ele.data("position").lon - 6) * 100000, "y":(-ele.data("position").lat + 46) * 100000}}
			},
			elements: this.nodes.concat(this.links)
		});
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

var cy;
var nodes_pos_dict;


whenDocumentLoaded(() => {
	$("#nav_graph").addClass("active")
	d3.json(URL_FULL + BASE_URL + "/data/nodes_dict.json")
		.then(function(dict){
		nodes_pos_dict = dict

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

	$('#paths-check').click(function() {
		let edges = cy.edges();

		if(this.checked){
			edges.show()
		}else{
			edges.hide()
		}
	});

	$('#rest-nodes-check').click(function() {
		let nodes = cy.filter(function(element, i){
		  return element.isNode() && element.data('starting_node') == true;
		});

		if(this.checked){
			nodes.show()
		}else{
			nodes.hide()
		}
	});

	$('#inter-nodes-check').click(function() {
		let nodes = cy.filter(function(element, i){
		  return element.isNode() && element.data('ending_node') == false && element.data('starting_node') == false;
		});

		if(this.checked){
			nodes.show()
		}else{
			nodes.hide()
		}
	});

	$('#dest-nodes-check').click(function() {
		let nodes = cy.filter(function(element, i){
		  return element.isNode() && element.data('ending_node') == true;
		});

		if(this.checked){
			nodes.show()
		}else{
			nodes.hide()
		}
	});

});
