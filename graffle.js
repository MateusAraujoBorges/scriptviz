//"borrowed" from http://raphaeljs.com/graffle.html
Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
    } else {
        var color = typeof line == "string" ? line : "#000";
        return {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color, fill: "none"}),
            from: obj1,
            to: obj2
        };
    }
};

var el;
window.onload = function () {
    var dragger = function () {
		// if (this.type == "circle") {
		// 	var text = this.myText; //apply same changes to the text
		// 	text.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
		// 	text.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
		// 	this.animate({"fill-opacity": .2}, 500);
		// }
//        this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
//        this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");

		var x,y,isCircle = false;
		if (this.type == "rect" || this.type == "text") {
			x = this.attr("x"); 
			y = this.attr("y");
		} else if (this.type == "circle") {
			x = this.attr("cx"); 
			y = this.attr("cy");
			isCircle = true;
		}

		this.ox = x;
		this.oy = y;
        this.animate({"fill-opacity": .2}, 500);

		if(isCircle) {
			dragger.apply(this.myText);
		}
    },
        move = function (dx, dy) { //'this' here is a Raphael's Element
            var att = (this.type == "rect" || this.type == "text") ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
			if(this.type == "circle") {
				this.attr(att); //sets attributes of an Element
				this.myText.attr({x:(att.cx),y:(att.cy)});
			}
            
            for (var i = connections.length; i--;) {
                r.connection(connections[i]);
            }
            r.safari();
        },
        up = function () {
            this.animate({"fill-opacity": 0}, 500);
			if(this.type == "circle") {
				this.myText.animate({"fill-opacity": 0}, 500);
			}
        },
        r = Raphael("holder", 740, 600),
        connections = [],
        shapes = [  r.ellipse(190, 100, 30, 20),
                    r.rect(290, 80, 60, 40, 10),
                    r.rect(290, 180, 60, 40, 2),
                    r.ellipse(450, 100, 20, 20)
                ],
	    buildGraph = function(data) { //show graph in image
			r.clear(); //clean existing shapes from paper
			shapes = []; //clean existing shapes
			var nodes = data.nodes;
			var edges = data.edges;
			var radius = data.config.radius;
			var width = data.config.width;
			var height = data.config.height;
			var nodeToShape = {};

			nodes.forEach(function(element,index,array){
				var id = element.id;
				var label = element.label;
				var x,y;
				//check if position is already determined
				if (element.x !== undefined && element.y !== undefined) {
					x = element.x;
					y = element.y;
				} else {
					x = Math.random()*(width);
					y = Math.random()*(height);
				}
				var shapeSet = r.set(); //lets combine both text and shape!
				var text = r.text(x,y,label);
				var circle = r.circle(x,y,radius);
				circle.myText = text;
				shapeSet.push (text,circle);

				var color = Raphael.getColor();
				shapeSet.attr({fill: color, stroke: color, "fill-opacity": 0, "stroke-width": 2, cursor: "move"});
				shapeSet.drag(move, dragger, up);				
				shapes.push(shapeSet);

				nodeToShape[id] = shapeSet;
			});

			//now create the connections for each Node
			var edgeLine = data.config.edgeLine;
			nodes.forEach(function(element,index,array){
				var id = element.id;
				var adjList = edges[id];
				var shape = nodeToShape[id];
				adjList.forEach(function(element,index,array) {
				    connections.push(r.connection(shape,nodeToShape[element], "#fff", edgeLine));
				});
			});
		}
	
	for (var i = 0, ii = shapes.length; i < ii; i++) {
      var color = Raphael.getColor();
      shapes[i].attr({fill: color, stroke: color, "fill-opacity": 0, "stroke-width": 2, cursor: "move"});
      shapes[i].drag(move, dragger, up);
	}
    connections.push(r.connection(shapes[0], shapes[1], "#fff"));
    connections.push(r.connection(shapes[1], shapes[2], "#fff", "#fff|5"));
    connections.push(r.connection(shapes[1], shapes[3], "#000", "#fff"));

//bind function to button
	document.getElementById('eval').onclick = function() {
		var text = document.getElementById('inputbox').value;
		var data = Scriptviz.process(text);
//		var newPos = Scriptviz.kk(data);
		buildGraph(data);
	}
};

