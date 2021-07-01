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
	// raycast and select the first object that intersects, if none then select world
	let i;
	let ray = raycast(event.pageX*2/gl.canvas.width - 1, -(event.pageY*2/gl.canvas.height - 1))
	let hit = false;
	for(i=0; i<renderer.objects.length; i++){
		if(raySphereIntersection([cx,cy,cz], ray, renderer.objects[i].position, 5)){
			focusedObjectName = renderer.objects[i].name;
			hit = true;
			console.log(focusedObjectName)
			break;
		}
	}
	if(!hit){
		focusedObjectName='world';
		console.log('no hit, reset')
	}

}
function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}
function doWheelRotate(event){
	if(focusedObjectName == 'world'){
		// console.log(event.deltaX, event.deltaY, event.deltaZ);
		lookRadius += event.deltaY;
	}
	else{
		renderer.updateObjectHeight(focusedObjectName, event.deltaY);
	}
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
			// raycast event.x and .y to y plane to find the new position of the object
			// canvas coordinates -> normalized screen coordinates
			x = event.pageX * 2 / gl.canvas.width - 1;
			y = event.pageY * 2 / gl.canvas.height - 1;
			y = -y;

			let worldSpaceRay = raycast(x,y);

			let cameraCoordinates;
			cameraCoordinates = [cx,cy,cz];
			// console.log('cam coords',cameraCoordinates)
			// now calculate intersection with y=0
			// calculate intersection with y=object height
			let height = renderer.objects.filter(item => item.name == focusedObjectName);
			height = height[0].position[1];
			plane_x = (height-cy) / worldSpaceRay[1] * worldSpaceRay[0] + cx;
			plane_z = (height-cy) / worldSpaceRay[1] * worldSpaceRay[2] + cz;
			console.log('updated coordinates',plane_x, plane_z);
			renderer.updateObjectPosition(focusedObjectName, plane_x, plane_z);
			
		}
		
	}
}


function raycast(x, y){
	let invProjection;
	let cameraSpaceRay, worldSpaceRay;
	let invView;
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
	return worldSpaceRay;
}


//This algorithm is taken from the book Real Time Rendering fourth edition
function raySphereIntersection(rayStartPoint, rayNormalisedDir, sphereCentre, sphereRadius){
    //Distance between sphere origin and origin of ray
    var l = [sphereCentre[0] - rayStartPoint[0], sphereCentre[1] - rayStartPoint[1], sphereCentre[2] - rayStartPoint[2]];
    var l_squared = l[0] * l[0] + l[1] * l[1] + l[2] * l[2];
    //If this is true, the ray origin is inside the sphere so it collides with the sphere
    if(l_squared < (sphereRadius*sphereRadius)){
        console.log("ray origin inside sphere");
        return true;
    }
    //Projection of l onto the ray direction 
    var s = l[0] * rayNormalisedDir[0] + l[1] * rayNormalisedDir[1] + l[2] * rayNormalisedDir[2];
    //The spere is behind the ray origin so no intersection
    if(s < 0){
        console.log("sphere behind ray origin");
        return false;
    }
    //Squared distance from sphere centre and projection s with Pythagorean theorem
    var m_squared = l_squared - (s*s);
    //If this is true the ray will miss the sphere
    if(m_squared > (sphereRadius*sphereRadius)){
        console.log("m squared > r squared");
        return false;
    }
    //Now we can say that the ray will hit the sphere 
    console.log("hit");
    return true;
    
}

function addListeners(canvas){
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("wheel", doWheelRotate, false);
}