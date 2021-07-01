var lookRadius = 30;
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
		if(focusedObjectName == 'world'){
			var dx = event.pageX - lastMouseX;
			var dy = lastMouseY - event.pageY;
			lastMouseX = event.pageX;
			lastMouseY = event.pageY;
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
			// raycast event.x and .y to y plane to find the new position of the object
			// canvas coordinates -> normalized screen coordinates
			x = event.pageX * 2 / gl.canvas.width - 1;
			y = event.pageY * 2 / gl.canvas.height - 1;
			y = -y;
			
			invProjection = utils.invertMatrix(projectionMatrix);
			invView = utils.invertMatrix(viewMatrix)
			cameraSpaceRay = utils.multiplyMatrixVector(invProjection, [x, y, -1, 1]);
			cameraSpaceRay[3] = 0;
			// console.log('cam',cameraSpaceRay)
			worldSpaceRay = utils.multiplyMatrixVector(invView, cameraSpaceRay);
			// console.log('world',worldSpaceRay)
			worldSpaceRay[0] = worldSpaceRay[0]/worldSpaceRay[2]
			worldSpaceRay[1] = worldSpaceRay[1]/worldSpaceRay[2]
			worldSpaceRay[2] = worldSpaceRay[2]/worldSpaceRay[2]
			// console.log('norm world',worldSpaceRay)


			cameraCoordinates = [5,5,5];
			// console.log('cam coords',cameraCoordinates)
			// // now calculate intersection with y=0
			plane_x = -cy / worldSpaceRay[1] * worldSpaceRay[0] + cx;
			plane_z = -cy / worldSpaceRay[1] * worldSpaceRay[2] + cz;
			// console.log('updated coordinates',plane_x, plane_z);
			renderer.updateObjectMouse(focusedObjectName, plane_x, plane_z);
			
		}
		
	}
}

function addListeners(canvas){
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
}