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
				 console.log( "automataRotoZoom::init", conf);
				},
	nothing	: function(conf, event, touch) {
					 console.log( "automataRotoZoom::nothing", conf, event);
					 var style = window.getComputedStyle( conf.node );
					 conf.originalMatrix	= transfo.getMatrixFromString( style.transform );
					 conf.originalMatrixInv	= conf.originalMatrix.inverse();
					 conf.currentMatrix		= transfo.getMatrixFromString( style.transform );
					 // console.log(style.transform, conf.originalMatrix);
					 // Compute touch point
					 conf.touchesId[touch.identifier] = {
						  point			: transfo.getPoint(touch.pageX, touch.pageY).matrixTransform( conf.originalMatrixInv )
						, currentPoint	: transfo.getPoint(touch.pageX, touch.pageY)
						};
					 configOfTouchId[ touch.identifier ] = conf;
					 // Next state
					 conf.state = "drag";
					 conf.node.style.zIndex = zIndex++;
				},
	drag	: function(conf, event, touch) {
				 // TO BE DONE
				 switch(event) {
					 case "release":
						 console.log("drag release of", touch.identifier);
						 delete configOfTouchId[touch.identifier];
						 delete conf.touchesId[touch.identifier];
						 conf.state		= "nothing";
						 break;
					 case "move":
						 console.log("drag with", touch.identifier);
						 conf.touchesId[touch.identifier].currentPoint.x = touch.pageX;
						 conf.touchesId[touch.identifier].currentPoint.y = touch.pageY;
						 transfo.dragNode( conf.node
										 , conf.originalMatrix, conf.touchesId[touch.identifier].point
										 , conf.currentMatrix
										 , touch.pageX, touch.pageY
										 );
						 break;
					 case "press":
						 console.log("drag press with", touch.identifier);
						 
						 configOfTouchId[ touch.identifier ] = conf;
						 conf.state = "rotozoom";
						 break;
					}
				},
	rotozoom: function(conf, event, touch) {
				 // TO BE DONE
				 console.log( "automataRotoZoom::rotozoom", conf, event);
				}
};


//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
// Subscribe to mouse events
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
function startMouse(event) {
	event.preventDefault();
	event.stopPropagation();
	var node	= event.currentTarget
	  , conf	= config[ node.dataset.confId ]
	  ;
	console.log("startMouse");
	conf.automata[conf.state].apply(conf, [conf, "press", event]);
}

//______________________________________________________________________________________________________________________
function endMouse(event) {
	event.preventDefault();
	event.stopPropagation();
	var conf	= configOfTouchId[ undefined ];
	console.log("endMouse");
	if(conf) {
		conf.automata[conf.state].apply(conf, [conf, "release", event]);
		}
}

document.addEventListener( "mouseup", endMouse, false);

//______________________________________________________________________________________________________________________
// Subscribe to touch events end or cancel
function mouseMove(event) {
	event.preventDefault();
	event.stopPropagation();
	var conf	= configOfTouchId[ undefined ];
	if(conf) {
		conf.automata[conf.state].apply(conf, [conf, "move", event]);
		}
}

document.addEventListener( "mousemove", mouseMove, false);


//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
// Subscribe to touch events
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
function startTouch(event) {
	event.preventDefault();
	event.stopPropagation();
	var node	= event.currentTarget
	  , conf	= config[ node.dataset.confId ]
	  , L		= event.changedTouches
	  , i, touch
	  ;
	for(i=0; i< L.length; i++) {
		 touch = L.item(i);
		 conf.automata[conf.state].apply(conf, [conf, "press", touch]);
		}
}

//______________________________________________________________________________________________________________________
// Subscribe to touch events end or cancel
function endTouch(event) {
	event.preventDefault();
	event.stopPropagation();
	var i, L = event.changedTouches,touch, conf;
	for(i=0; i< L.length; i++) {
		touch = L.item(i);
		conf = configOfTouchId[ touch.identifier ];
		if(conf) {
			conf.automata[conf.state].apply(conf, [conf, "release", touch]);
		}
	}
}

document.addEventListener( "touchend"   , endTouch, false);
document.addEventListener( "touchcancel", endTouch, false);

//______________________________________________________________________________________________________________________
// Subscribe to touch events end or cancel
function moveTouch(event) {
	event.preventDefault();
	event.stopPropagation();
	var i, L = event.changedTouches,touch, conf;
	for(i=0; i< L.length; i++) {
		touch = L.item(i);
		conf = configOfTouchId[ touch.identifier ];
		if(conf) {
			conf.automata[conf.state].apply(conf, [conf, "move", touch]);
		}
	}
}

document.addEventListener( "touchmove"   , moveTouch, false);


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
	node.addEventListener	( "touchstart", startTouch, false );
	node.addEventListener	( "mousedown" , startMouse, false );

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