(function() {
"use strict";
	//fill here with the scriptviz functions
	//reference: http://stackoverflow.com/questions/2945988/javascript-namespace-help
	function process(text) {
		var obj = JSON.parse(text);
		console.debug(obj);
		return obj;
	}
	window.Scriptviz = 
	{
		'process' : process
	};
})();
