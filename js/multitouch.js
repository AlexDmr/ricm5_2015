var config			= []
  , configOfTouchId = {}
  , transfo			= require("./transfo.js")
  , zIndex			= 0
  ;


//______________________________________________________________________________________________________________________
var automataRotoZoom = {
	init	: function(conf) {
				 conf.touchesId = {};
				 conf.state = "nothing";
				 conf.node.dataset.confId = config.length;
				 conf.node.style.transform = conf.node.style.transform || "translate(0,0)";
				 config.push( conf );
				},
	nothing	: function(conf, event, touch) {
				 // TO BE DONE
				},
	drag	: function(conf, event, touch) {
				 // TO BE DONE
				},
	rotozoom: function(conf, event, touch) {
				 // TO BE DONE
				}
};

//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
// Function to be exported
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
function multiTouch(node) {
	var conf = {
		node: node,
		state: "init",
		automata: automataRotoZoom
		};
	node.style.zIndex		= zIndex++;
	node.style.transform	= "matrix(0.5,0,0,0.5,0,0)";
	conf.automata[conf.state].apply(conf, [conf]);
	node.classList.add("multitouch");
}


//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
module.exports = function(sel) {
	var L;
	switch(typeof sel) {
		case "string":
			L = Array.prototype.slice.call( document.querySelectorAll(sel) );
			break;
		case "object":
			if( HTMLElement.prototype.isPrototypeOf(sel) ) {
				L = [sel]
			}
			if( Array.prototype.isPrototypeOf(sel) ) {
				L = sel;
			}
			break;
		default: L = [];
	}
	L.forEach( multiTouch );
};