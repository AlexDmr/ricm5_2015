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
				 if(event === "press") {
					 // console.log("nothing press with", touch.identifier);
					 // Compute matrix
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
				 	}
				},
	drag	: function(conf, event, touch) {
				 switch(event) {
					 case "release":
						 // console.log("drag release of", touch.identifier);
						 delete configOfTouchId[touch.identifier];
						 delete conf.touchesId[touch.identifier];
						 conf.state		= "nothing";
						 break;
					 case "move":
						 // console.log("drag with", touch.identifier);
						 conf.touchesId[touch.identifier].currentPoint.x = touch.pageX;
						 conf.touchesId[touch.identifier].currentPoint.y = touch.pageY;
						 transfo.dragNode( conf.node
										 , conf.originalMatrix, conf.touchesId[touch.identifier].point
										 , conf.currentMatrix
										 , touch.pageX, touch.pageY
										 );
						 break;
					 case "press":
						 // console.log("drag press with", touch.identifier);
						 // Update matrix
						 conf.originalMatrix	= transfo.copyMatrix( conf.currentMatrix );
						 conf.originalMatrixInv	= conf.originalMatrix.inverse();
						 
						 // Compute touch point
						 conf.touches = Object.keys(conf.touchesId);
						 conf.touches.push(touch.identifier);
						 conf.touchesId[touch.identifier] = {
							  point			: transfo.getPoint(touch.pageX, touch.pageY).matrixTransform( conf.originalMatrixInv )
							, currentPoint	: transfo.getPoint(touch.pageX, touch.pageY)
							};
						 configOfTouchId[ touch.identifier ] = conf;
						 conf.state = "rotozoom";
						 break;
					}
				},
	rotozoom: function(conf, event, touch) {
				 switch(event) {
					 case "release":
						 delete configOfTouchId[touch.identifier];
						 conf.originalMatrix	= transfo.copyMatrix( conf.currentMatrix );
						 conf.originalMatrixInv	= conf.originalMatrix.inverse();
						 conf.state = "drag";
						 break;
					 case "move":
						 // console.log("rotozoom with", touch.identifier);
						 conf.touchesId[touch.identifier].currentPoint.x = touch.pageX;
						 conf.touchesId[touch.identifier].currentPoint.y = touch.pageY;
						 var id1 = conf.touches[0]
						   , id2 = conf.touches[1];
						 transfo.rotoZoomNode( conf.node
											 , conf.originalMatrix, conf.currentMatrix
											 , conf.touchesId[id1].point, conf.touchesId[id1].currentPoint
											 , conf.touchesId[id2].point, conf.touchesId[id2].currentPoint
											 );
						 break;
					}
				}
};

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
	node.style.transform	= "matrix(0.5,0,0,0.5,0,0)";// + (-100*Math.random()) + "," + (-100*Math.random()) + ")";
	conf.automata[conf.state].apply(conf, [conf]);
	node.addEventListener( "touchstart", startTouch, false );
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