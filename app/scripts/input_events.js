function projectPointer(x, y, h=0){
	let worldSpaceRay = raycast(x,y);
	let cameraCoordinates = [renderer.camera.x, renderer.camera.y, renderer.camera.z];
	// calculate intersection with y=object height
	let height = h;
	plane_x = (height-cameraCoordinates[1]) / worldSpaceRay[1] * worldSpaceRay[0] + cameraCoordinates[0];
	plane_z = (height-cameraCoordinates[1]) / worldSpaceRay[1] * worldSpaceRay[2] + cameraCoordinates[2];

	return [plane_x, plane_z];
}


function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
	if(!play_state){
		if(toggleCreate != 'none' && toggleCreate != 'delete'){
			let x, y;
			// raycast event.x and .y to y plane to find the new position of the object
			// canvas coordinates -> normalized screen coordinates
			x = event.pageX * 2 / gl.canvas.width - 1;
			y = event.pageY * 2 / gl.canvas.height - 1;
			y = -y;
			let projection_coordinates = projectPointer(x, y);
			plane_x = projection_coordinates[0];
			plane_z = projection_coordinates[1];
			renderer.addObject(toggleCreate+'_'+renderer.objects.length, // object name
								toggleCreate, // model name
								[plane_x,0, plane_z], // position
								new Quaternion()); // orientation
		}
		else if(toggleCreate == 'none'){
			// select focused object by clicking on it
			// raycast and select the first object that intersects, if none then select world
			let i;
			let ray = raycast(event.pageX*2/gl.canvas.width - 1, -(event.pageY*2/gl.canvas.height - 1))
			let hit = false;
			for(i=0; i<renderer.objects.length; i++){
				if(renderer.objects[i].name != 'triangle_0'){
					if(raySphereIntersection([renderer.camera.x,renderer.camera.y,renderer.camera.z], ray, renderer.objects[i].position, 2)){
						focusedObjectName = renderer.objects[i].name;
						hit = true;
						console.log(focusedObjectName)
						break;
					}
				}
			}
			if(!hit){
				focusedObjectName='world';
				console.log('no hit, reset')
			}
		}
		else{
			// delete clicked objects
			let i;
			let ray = raycast(event.pageX*2/gl.canvas.width - 1, -(event.pageY*2/gl.canvas.height - 1))
			let hit = false;
			for(i=0; i<renderer.objects.length; i++){
				if(renderer.objects[i].name != 'triangle_0'){
					if(raySphereIntersection([renderer.camera.x,renderer.camera.y,renderer.camera.z], ray, renderer.objects[i].position, 10)){
						console.log('deleting', renderer.objects[i].name)
						renderer.deleteObject(renderer.objects[i].name)
						focusedObjectName = 'world'
						break;
					}
				}
			}
		}
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
		cameraParameters['radius'] += event.deltaY * wheelSensitivity;
	}
	else{
		renderer.updateObjectHeight(focusedObjectName, event.deltaY * wheelSensitivity);
	}
}


function doMouseMove(event) {
	if(mouseState) {
		// // ######### raycast mouse pointer and build debug triangle ###########
		// let x, y;
		// // raycast event.x and .y to y plane to find the new position of the object
		// // canvas coordinates -> normalized screen coordinates
		// x = event.pageX * 2 / gl.canvas.width - 1;
		// y = event.pageY * 2 / gl.canvas.height - 1;
		// y = -y;
		// let projection_coordinates = projectPointer();
		// plane_x = projection_coordinates[0];
		// plane_z = projection_coordinates[1];
		// let triangleModel = renderer.models.filter(item=>item.name=='triangle')[0]
		// triangleModel.model.vertices[0] = plane_x;
		// triangleModel.model.vertices[2] = plane_z;
		// gl.bindBuffer(gl.ARRAY_BUFFER, triangleModel.vertexBuffer);
		// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleModel.model.vertices), gl.STATIC_DRAW);
		// gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		// // ##########################################
		if(focusedObjectName == 'world'){ // move camera view
			var dx = event.pageX - lastMouseX;
			var dy = lastMouseY - event.pageY;
			lastMouseX = event.pageX;
			lastMouseY = event.pageY;
			if((dx != 0) || (dy != 0)) {
				renderer.camera.angle = renderer.camera.angle + 0.5 * dx;
				renderer.camera.elevation = renderer.camera.elevation + 0.5 * dy;
			}
		}
		else{ // raycast mouse pointer and move objects
			let x, y;
			// raycast event.x and .y to y plane to find the new position of the object
			// canvas coordinates -> normalized screen coordinates
			x = event.pageX * 2 / gl.canvas.width - 1;
			y = event.pageY * 2 / gl.canvas.height - 1;
			y = -y;
			let height = renderer.objects.filter(item => item.name == focusedObjectName)[0].position[1];
			let projection_coordinates = projectPointer(x, y, height);
			plane_x = projection_coordinates[0]
			plane_z = projection_coordinates[1]
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


function onSliderChangeColor1(value){
    console.log("Slider value changed to "+value);
    color[0] = parseFloat(value);
}


function onSliderChangeColor2(value){
    console.log("Slider value changed to "+value);
    color[1] = parseFloat(value);
}


function onSliderChangeColor3(value){
    console.log("Slider value changed to "+value);
    color[2] = parseFloat(value);
}


function onSliderChangeLight1(value){
    console.log("Slider value changed to "+value);
    light[0] = parseFloat(value);
}


function onSliderChangeLight2(value){
    console.log("Slider value changed to "+value);
    light[1] = parseFloat(value);
}


function onSliderChangeLight3(value){
    console.log("Slider value changed to "+value);
    light[2] = parseFloat(value);
}


function play(){
	focusedObjectName = 'world';
	play_state = true;
}


function create(){
	play_state = false;
}


function onRadioButtonChange(value){
  console.log("Radio button value changed to "+value);
  projectionType = value;
}


function onRadioButtonChangeCamera(value){
	console.log("Radio button value changed to "+value);
	cameraType = value;
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


function onSliderChangeWheelSensitivity(value){
    console.log("Slider value changed to "+value);
    wheelSensitivity = value;
}


function onSliderChangeFov(value){
    console.log("Slider value changed to "+value);
    fov = value;
}


function onSliderChangeSpriteOrientation(value){
	console.log("Slider value changed to "+value);
	spriteOrientation = value;
}


function raycast(x, y){
	let invProjection;
	let cameraSpaceRay, worldSpaceRay;
	let invView;
	invProjection = utils.invertMatrix(renderer.camera.createProjection(projectionType));
	invView = utils.invertMatrix(renderer.camera.view())
	cameraSpaceRay = utils.multiplyMatrixVector(invProjection, [x, y, -1, 1]);
	cameraSpaceRay[3] = 0;
	worldSpaceRay = utils.multiplyMatrixVector(invView, cameraSpaceRay);
	worldSpaceRay = utils.normalizeVector3(worldSpaceRay)

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


function doKeyDown(e){
	let lookAtVectorLength, cosx, cosy, cosz;

		if(!play_state){
			if(document.getElementById("quaternionRotation").checked){
				switch(e.keyCode) {// object rotation
					case 81://q
						renderer.updateOrientation(focusedObjectName, -10,0,0)
						break;
					case 87://w
						renderer.updateOrientation(focusedObjectName,10,0,0)
						break;
					case 65://a
						renderer.updateOrientation(focusedObjectName,0,-10,0)
						break;
					case 83://s
						renderer.updateOrientation(focusedObjectName,0,10,0)
						break;
					case 90://z
						renderer.updateOrientation(focusedObjectName,0,0,-10)
						break;
					case 88://x
						renderer.updateOrientation(focusedObjectName,0,0,10)
						break;
				}
			}
			else{
				switch(e.keyCode) {// object rotation but with world axis
					case 81://q
						renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientationDeg[0] -= 10
						break;
					case 87://w
						renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientationDeg[0] += 10
						break;
					case 65://a
						renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientationDeg[1] -= 10
						break;
					case 83://s
						renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientationDeg[1] += 10
						break;
					case 90://z
						renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientationDeg[2] -= 10
						break;
					case 88://x
						renderer.objects.filter(item=>item.name==focusedObjectName)[0].orientationDeg[2] += 10
						break;
				}
			}
			switch(e.keyCode){// camera control
				case 39: // right arrow move right
					renderer.camera.move(1,0,0)
					break;
				case 37: // left arrow move left
					renderer.camera.move(-1,0,0)
					break;
				case 33: // page up move up
					renderer.camera.move(0,1,0)
					break;
				case 34: // page down move down
					renderer.camera.move(0,-1,0)
					break;
				case 38: // forward/up arrow move closer, forward
					renderer.camera.move(0,0,-1)
					break;
				case 40: // down arrow move back
					renderer.camera.move(0,0,1)
					break;
				case 84: // t
					renderer.camera.elevation -= 1;
					break;
				case 89: // y
					renderer.camera.elevation += 1;
					break;
				case 71: // g
					renderer.camera.angle -= 1;
					break;
				case 72: // h
					renderer.camera.angle += 1;
					break;
			}
		}
		else{
			if(!pressedKeys[e.keyCode]){
				pressedKeys[e.keyCode] = true;
				switch(e.keyCode){
					case 87: // w
						renderer.sprite.forwardSpeed += 1;
						// renderer.sprite.startMove(0,0,-1);
					break;
					case 65: // a
						renderer.sprite.rightSpeed -= 1;
						// renderer.sprite.startMove(-1,0,0);
					break;
					case 83: // s
						renderer.sprite.forwardSpeed -= 1;
						// renderer.sprite.startMove(0,0,1);
					break;
					case 68: // d
						renderer.sprite.rightSpeed += 1;
						// renderer.sprite.startMove(1,0,0);
					break;

					case 32: //spacebar

					let obj = renderer.objects.filter(item => item.name.includes("ghost"))[0];
					console.log("position ghost y=" +obj.position[1])

					//if((obj.position[1]==0 && renderer.sprite.upSpeed==0)||(obj.position[1]<10 && renderer.sprite.upSpeed==1)){
						if(renderer.sprite.upSpeed==0){

						renderer.sprite.upSpeed =1;}
					break;
				}
			}
		}
}


function doKeyUp(e){
	if(pressedKeys[e.keyCode]){
		pressedKeys[e.keyCode] = false;
		switch(e.keyCode){
			case 87: // w
				renderer.sprite.forwardSpeed -= 1;
				// renderer.sprite.stopMove(0,0,-1);
			break;
			case 65: // a
				renderer.sprite.rightSpeed += 1;
				// renderer.sprite.stopMove(-1,0,0);
			break;
			case 83: // s
				renderer.sprite.forwardSpeed += 1;
				// renderer.sprite.stopMove(0,0,1);
			break;
			case 68: // d
				renderer.sprite.rightSpeed -= 1;
				// renderer.sprite.stopMove(1,0,0);
			break;
			case 32: // d

			break;

		}
	}
}


function addListeners(canvas){
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("wheel", doWheelRotate, false);
	// window.addEventListener("keyup", keyFunctionUp, false);
	window.addEventListener("keydown", doKeyDown, false);
	window.addEventListener("keyup", doKeyUp, false);
}
