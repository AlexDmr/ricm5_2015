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
	var point_par_rapport_parent = getPoint(x, y)
	  , M = currentMatrix;
	// point_par_rapport_parent = point_par_rapport_parent.matrixTransform(originalMatrix.inverse());
	
	// Calcul de e et f
	M.e = point_par_rapport_parent.x - M.a*point_init_par_rapport_node.x - M.c*point_init_par_rapport_node.y;
	M.f = point_par_rapport_parent.y - M.b*point_init_par_rapport_node.x - M.d*point_init_par_rapport_node.y;
					
	// On modifie notre svg avec la matrice calculé
	node.style.transform = "matrix("+M.a+", "+M.b+", "+M.c+", "+M.d+", "+M.e+", "+M.f+")";
}

//______________________________________________________________________________________________________________________
function rotoZoomNode( node
					 , originalMatrix, currentMatrix
					 , pt_init_1, pt_current_1
					 , pt_init_2, pt_current_2
					 ) {
	var c, s;
	var dx			= pt_init_2.x		- pt_init_1.x	;
	var dy			= pt_init_2.y		- pt_init_1.y	;
	var dx_prime	= pt_current_2.x	- pt_current_1.x;
	var dy_prime	= pt_current_2.y	- pt_current_1.y;
	if (dx === 0 && dx !== dy){
		c = dy_prime/dy;
		s = -dx_prime/dy;
	} else if (dy === 0 && dx !== dy){
		s = dy_prime/dx;
		c = dx_prime/dx;
	} else if ( dx !== 0 && dx !== dy) {
		s = (dy_prime/dy - dx_prime/dx)/(dy/dx + dx/dy);
		c = (dx_prime + s*dy)/dx;
	} else {return;}
	
	var e = pt_current_1.x - c*pt_init_1.x + s*pt_init_1.y;
	var f = pt_current_1.y - s*pt_init_1.x - c*pt_init_1.y;

	var M = currentMatrix;
	M.a=c; M.b=s; M.c=(-s); M.d=c; M.e=e; M.f=f;
	node.style.transform = "matrix("+M.a+", "+M.b+", "+M.c+", "+M.d+", "+M.e+", "+M.f+")";
	// node.style.transform = "matrix("+c+", "+s+", "+(-s)+", "+c+", "+e+", "+f+")";
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
