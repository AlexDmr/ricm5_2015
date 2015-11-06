var re_matrix = /^matrix\((.*), (.*), (.*), (.*), (.*), (.*)\)$/;

var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
var idM	= svg.createSVGMatrix();
idM.a=1; idM.b=0; idM.c=0; idM.d=1; idM.e=0; idM.f=0;

//______________________________________________________________________________________________________________________
function getMatrixFromString(str) {
    var res		= re_matrix.exec( str )
      , matrix	= svg.createSVGMatrix()
      ;
    matrix.a = parseFloat(res[1]) || 1;
    matrix.b = parseFloat(res[2]) || 0;
    matrix.c = parseFloat(res[3]) || 0;
    matrix.d = parseFloat(res[4]) || 1;
    matrix.e = parseFloat(res[5]) || 0;
    matrix.f = parseFloat(res[6]) || 0;

    return matrix;
}

//______________________________________________________________________________________________________________________
function getPoint(x, y) {
    var point = svg.createSVGPoint();
    point.x = x || 0;
    point.y = y || 0;
    return point;
}

//______________________________________________________________________________________________________________________
function getMatrixFromNode(node) {
	return getMatrixFromString( window.getComputedStyle(node).transform || "matrix(1,1,1,1,1,1)" );
}

//______________________________________________________________________________________________________________________
function dragNode( node
				 , originalMatrix, point_init_par_rapport_node
				 , currentMatrix
				 , x, y) {
	// TO BE DONE
}

//______________________________________________________________________________________________________________________
function rotoZoomNode( node
					 , originalMatrix, currentMatrix
					 , pt_init_1, pt_current_1
					 , pt_init_2, pt_current_2
					 ) {
	// TO BE DONE
}

//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
module.exports = {
    getMatrixFromNode	: getMatrixFromNode,
	getMatrixFromString : getMatrixFromString,
    getPoint            : getPoint,
	dragNode			: dragNode,
	rotoZoomNode		: rotoZoomNode,
	copyMatrix			: function(M) {return M.multiply(idM);}
};
