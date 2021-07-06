function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
	// raycast and select the first object that intersects, if none then select world
	// let i;
	// let ray = raycast(event.pageX*2/gl.canvas.width - 1, -(event.pageY*2/gl.canvas.height - 1))
	// let hit = false;
	// for(i=0; i<renderer.objects.length; i++){
	// 	if(renderer.objects[i].name != 'triangle_0'){
	// 		if(raySphereIntersection([cx,cy,cz], ray, renderer.objects[i].position, 1)){
	// 			focusedObjectName = renderer.objects[i].name;
	// 			hit = true;
	// 			console.log(focusedObjectName)
	// 			break;
	// 		}
	// 	}
		
	// }
	// if(!hit){
	// 	focusedObjectName='world';
	// 	console.log('no hit, reset')
	// }

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
		//########################################
		let x, y;
		// raycast event.x and .y to y plane to find the new position of the object
		// canvas coordinates -> normalized screen coordinates
		x = event.pageX * 2 / gl.canvas.width - 1;
		y = event.pageY * 2 / gl.canvas.height - 1;
		y = -y;
		// let height = renderer.objects.filter(item => item.name == focusedObjectName);
		// height = height[0].position[1];
		let height = 0;

		let worldSpaceRay = raycast(x,y);
		plane_x = (height-cy) / worldSpaceRay[1] * worldSpaceRay[0] + cx;
		plane_z = (height-cy) / worldSpaceRay[1] * worldSpaceRay[2] + cz;
		let triangleModel = renderer.models.filter(item=>item.name=='triangle')[0]
		triangleModel.model.vertices[0] = plane_x;
		triangleModel.model.vertices[2] = plane_z;
		// console.log(triangleModel.model.vertices)

		gl.bindBuffer(gl.ARRAY_BUFFER, triangleModel.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleModel.model.vertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		//##########################################
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
			// console.log('updated coordinates',plane_x, plane_z);
			if(focusedObjectName != 'triangle_0'){
				renderer.updateObjectPosition(focusedObjectName, plane_x, plane_z);
			}
			
			
			
		}
		
	}
}


function addTree(){
    let x = Math.random() * 100 - 50;
    let z = Math.random() * 100 - 50;
    let name = 'tree_'+renderer.objects.length;
    renderer.addObject(name, 'tree', [x,0,z], [0,0,0]);
    console.log(renderer.objects)
}


function onSliderChangex(value){
    console.log("Slider value changed to "+value);
    sliderValuex = value;
    renderer.updateObject(focusedObjectName);
}


function onSliderChangeScale(value){
	console.log("slider value changed to", value)
	sliderScale = value;
	renderer.updateObjectScale(focusedObjectName, value)
}


function onSliderChangey(value){
    console.log("Slider value changed to "+value);
    sliderValuey = value;
    renderer.updateObject(focusedObjectName);
}


function onSliderChangez(value){
    console.log("Slider value changed to "+value);
    sliderValuez = value;
    renderer.updateObject(focusedObjectName);
}


function onSliderChangeNear(value){
    console.log("Slider value changed to "+value);
    nearPlane = parseFloat(value);
}


function onSliderChangeFar(value){
    console.log("Slider value changed to "+value);
    farPlane = parseFloat(value);
}


function onSliderChangew(value){
    console.log("Slider value changed to "+value);
    cameraWindowWidth = value;
}


function onSliderChangeElevation(value){
    console.log("Slider value changed to "+value);
    cameraElevation = value;
}


function onSliderChangeAngle(value){
    console.log("Slider value changed to "+value);
    cameraAngle = value;
}


function onRadioButtonChange(value){
  console.log("Radio button value changed to "+value);
  projectionType = value;
}


function onSliderChangeWorldAnglex(value){
    console.log("Slider value changed to "+value);
    worldAnglex = value;
}


function onSliderChangeWorldAngley(value){
    console.log("Slider value changed to "+value);
    worldAngley = value;
}


function onSliderChangeWorldAnglez(value){
    console.log("Slider value changed to "+value);
    worldAnglez = value;
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
	console.log('ray start', rayStartPoint, 'direction',rayNormalisedDir, 'sphere centre',sphereCentre)
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


function keyFunctionDown(e){
	switch(e.keyCode) {
	case 81:
		renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientation[0] -= 10
		break;
	case 87:
		renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientation[0] += 10
		break;
	case 65:
		renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientation[1] -= 10
		break;
	case 83:
		renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientation[1] += 10
		break;
	case 90:
		renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientation[2] -= 10
		break;
	case 88:
		renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientation[2] += 10
		break;
	}
}


function addListeners(canvas){
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("wheel", doWheelRotate, false);
	// window.addEventListener("keyup", keyFunctionUp, false);
	window.addEventListener("keydown", keyFunctionDown, false);
}