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
	var diameter; 
	var EPSILON;
	var L; //ideal length of edge
	var lengthFactor; //to scale the preferred length of edge
	var disconnectedMultiplier; //fraction of diameter to be used as distance between disconnected vertices.
	var adjustForGravity; //rebalance system at the center of the plane
	var exchangeVertices; //use local minimum escape technique

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

	function computeDiameter() {
		var max = 0;

		for(var i = 0; i < nNodes; i++) {
			for (var j = 0; j < nNodes; j++) {
				if(i !== j && dm[i][j] !== INFINITY) {
					max = Math.max(max,dm[i][j]);
				}
			}
		}

		return max;
	}

	function processUnreachableNodes() {
		for(var i = 0; i < nNodes - 1; i++) {
			for (var j = i + 1; j < nNodes; j++) {
				var dist = diameter * disconnectedMultiplier;
				if(dm[i][j] !== INFINITY) {
					dist = Math.min(dm[i][j],dist);
				}
				if(dm[j][i] !== INFINITY) {
					dist = Math.min(dm[j][i],dist);
				}
				dm[i][j] = dist;
				dm[j][i] = dist;
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
		EPSILON = data.config.EPSILON;
		lengthFactor = data.config.lengthFactor;
		disconnectedMultiplier = data.config.disconnectedMultiplier;
		adjustForGravity = data.config.adjustForGravity === "true" ? true : false;
		exchangeVertices = data.config.exchangeVertices === "true" ? true : false;
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

		floydwarshall(); //compute distance matrix
		diameter = computeDiameter();

		var L0 = Math.min(height,width);
		L = (L0 / diameter) * lengthFactor;
		processUnreachableNodes();
				
		console.debug(vertices);
		console.debug(adj);
		console.debug(dm);		
	}

	//move the vertices so the gravity center of the system is at the center of screen
	function adjustGravity() {
		var gx = 0;
		var gy = 0;
		
		vertices.forEach(function(element){
			gx += element.x;
			gy += element.y;
		});
		gx = gx / nNodes;
		gy = gy / nNodes;
		var diffx = width / 2 - gx;
		var diffy = height / 2 - gy;

		vertices.forEach(function(element){
			element.x = element.x + diffx;
			element.y = element.y + diffy;
		});
	}

	//calculate new position to vertex m
	function calcDeltaXY(m) {
		var dE_dxm = 0;
		var dE_dym = 0;
		var d2E_d2xm = 0;
		var d2E_dxmdym = 0;
		var d2E_dymdxm = 0;
		var d2E_d2ym = 0;

		for (var i = 0; i < vertices.length; i++) {
			if (i !== m) {
                var dist = dm[m][i];
				var l_mi = L * dist;
				var k_mi = 1 / (dist * dist);
				var dx = vertices[m].x - vertices[i].x;
				var dy = vertices[m].y - vertices[i].y;
				var d = Math.sqrt((dx * dx) + (dy * dy));
				var ddd = d * d * d;

				dE_dxm += k_mi * (1 - l_mi / d) * dx;
				dE_dym += k_mi * (1 - l_mi / d) * dy;
				d2E_d2xm += k_mi * (1 - l_mi * dy * dy / ddd);
				d2E_dxmdym += k_mi * l_mi * dx * dy / ddd;
				d2E_d2ym += k_mi * (1 - l_mi * dx * dx / ddd);
			}
		}
		// d2E_dymdxm == d2E_dxmdym.
		d2E_dymdxm = d2E_dxmdym;

		var denomi = d2E_d2xm * d2E_d2ym - d2E_dxmdym * d2E_dymdxm;
		var deltaX = (d2E_dxmdym * dE_dym - d2E_d2ym * dE_dxm) / denomi;
		var deltaY = (d2E_dymdxm * dE_dxm - d2E_d2xm * dE_dym) / denomi;
		return [deltaX, deltaY];
	}

	// calculates the gradient of energy at the vertex m.
	function calcDeltaM(m) {
		var dEdxm = 0;
		var dEdym = 0;
		for (var i = 0; i < vertices.length; i++) {
			if (i !== m) {
                var dist = dm[m][i];
				var l_mi = L * dist;
				var k_mi = 1 / (dist * dist);

				var dx = vertices[m].x - vertices[i].x;
				var dy = vertices[m].y - vertices[i].y;
				var d = Math.sqrt(dx * dx + dy * dy);

				var common = k_mi * (1 - l_mi / d);
				dEdxm += common * dx;
				dEdym += common * dy;
			}
		}
		return Math.sqrt(dEdxm * dEdxm + dEdym * dEdym);
	}

	//calculates the energy of the system.
	function calcEnergy() {
		var energy = 0;
		for (var i = 0; i < vertices.length - 1; i++) {
			for (var j = i + 1; j < vertices.length; j++) {
                var dist = dm[i][j];
				var l_ij = L * dist;
				var k_ij = 1 / (dist * dist);
				var dx = vertices[i].x - vertices[j].x;
				var dy = vertices[i].y - vertices[j].y;
				var d = Math.sqrt(dx * dx + dy * dy);

				energy += k_ij / 2 * (dx * dx + dy * dy + l_ij * l_ij - 2 * l_ij * d);
			}
		}
		return energy;
	}


 // calculates the energy of the system as if positions of the 
 // vertex were swapped
	function calcEnergyIfExchanged(p,q) {
		if (p >= q) {
			throw "p must be smaller than q";
		}
		var energy = 0;	// < 0 ?
		for (var i = 0; i < nNodes - 1; i++) {
			for (var j = i + 1; j < nNodes; j++) {
				var ii = i;
				var jj = j;
				if (i === p) { ii = q; }
				if (j === q) { jj = p; }

                var dist = dm[i][j];
				var l_ij = L * dist;
				var k_ij = 1 / (dist * dist);
				var dx = dm[ii].x - dm[jj].x;
				var dy = dm[ii].y - dm[jj].y;
				var d = Math.sqrt(dx * dx + dy * dy);
				
				energy += k_ij / 2 * (dx * dx + dy * dy + l_ij * l_ij -  2 * l_ij * d);
			}
		}
		return energy;
	}

	function done() {
		return (iteration > maxIterations) ? true : false;
	}

	function process(text) {
		var obj = JSON.parse(text);
//		console.debug(obj);
		return obj;
	}

	function kk(data) {
		initialize(data);
		while(!done()) {
			step();
		}
	}

	window.Scriptviz = 
	{
		'process' : process,
		'kk'      : kk
	};
})();
