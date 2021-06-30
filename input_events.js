var lookRadius = 100;
var elevation = -15.0;
var angle = 0.0;
var cx = 100.0;
var cy = 100.0;
var cz = 100.0;
var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;

function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}
function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}
function doMouseMove(event) {
	if(mouseState) {
		var dx = event.pageX - lastMouseX;
		var dy = lastMouseY - event.pageY;
		lastMouseX = event.pageX;
		lastMouseY = event.pageY;
		
		if(focusedObjectName == 'world'){
			if((dx != 0) || (dy != 0)) {
				angle = angle + 0.5 * dx;
				elevation = elevation + 0.5 * dy;
			}
		}
		else{
			let x, y;
			let invProjection;
			let cameraSpaceRay, worldSpaceRay;
			let invView;
			let cameraCoordinates;
			renderer.updateObjectMouse(focusedObjectName, dx, dy);
			// raycast event.x and .y to y plane to find the new position of the object
			// x = event.pageX * 2 / gl.canvas.width - 1;
			// y = event.pageY * 2 / gl.canvas.height - 1;
			x = event.pageX;
			y = event.pageY;
			// y = -y;
			// console.log(x,y)
			invProjection = utils.invertMatrix(projectionMatrix);
			invView = utils.invertMatrix(viewMatrix)
			cameraSpaceRay = utils.multiplyMatrixVector(invProjection, [x, y, -1, 1]);
			// console.log(cameraSpaceRay)
			worldSpaceRay = utils.multiplyMatrixVector(invView, cameraSpaceRay);
			// console.log(worldSpaceRay)
			worldSpaceRay = utils.normalizeVector3(worldSpaceRay);
			// console.log(worldSpaceRay)
			cameraCoordinates = [cx,cy,cz];
			// now calculate intersection with y=0
			plane_x = -cy / worldSpaceRay[1] * worldSpaceRay[0] + cx;
			plane_z = -cy / worldSpaceRay[1] * worldSpaceRay[2] + cz;
			console.log(plane_x, plane_z);
			renderer.updateObjectMouse('tree_1', plane_x, plane_z);
			
		}
		
	}
}

function addListeners(canvas){
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
}