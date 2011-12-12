(function() {
"use strict";

	var iteration = 0;
	var maxIterations = 0;
	var width;
	var height;
	var vertices;
	var adj; //adjacency list
	var dm; //distance matrix
	var INFINITY = 1000000;
	var nNodes;

	function process(text) {
		var obj = JSON.parse(text);
//		console.debug(obj);
		return obj;
	}

	function kk(data) {
		initialize(data);
//		while(!done()) {
//			step();
//		}
	}
	//TODO add support for weighted/directed edges
	function floydwarshall() {
		//initialize the distance matrix
		for(var i = 0; i < nNodes; i++) {
			for (var j = 0; j < nNodes; j++) {
				if(i === j) {
					dm[i][j] = 0;
				} else {
					dm[i][j] = INFINITY;
				}
			}
		}

		adj.forEach(function(element,index,array){
			for(var i = 0; i < element.length; i++) {
				var edg = element[i] - 1;
				dm[index][edg] = 1;
				dm[edg][index] = 1;
			}
		});

		for(var k = 0; k < nNodes; k++) {
			for(var i = 0; i < nNodes; i++) {
				for (var j = 0; j < nNodes; j++) {
					dm[i][j] = Math.min(dm[i][j], dm[i][k] + dm[k][j]);				}
			}
		}
	}


	function initialize(data) {
		//load config params
		nNodes = data.nodes.length;
		iteration = 0;
		maxIterations = data.config.maxIterations;
		width = data.config.width;
		height = data.config.height;
		vertices = new Array(nNodes);
		adj = new Array(nNodes);
		dm = new Array(nNodes);

		data.nodes.forEach(function(element,index,array){
			element.x = Math.random() * width;
			element.y = Math.random() * height;
			element.scriptId = index;
			vertices[index] = element;
			var edges = data.edges[element.id];
			adj[index] = edges !== undefined ? edges : [];
			dm[index] = new Array(nNodes);
		});

		floydwarshall();
		
		console.debug(vertices);
		console.debug(adj);
		console.debug(dm);		
	}
	
	function done() {
		return (iteration > maxIterations) ? true : false;
	}

	function bfs() {

	}

	window.Scriptviz = 
	{
		'process' : process,
		'kk'      : kk
	};
})();
