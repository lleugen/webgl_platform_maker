function drawGhost(){
    // load object from file
    objectMesh = new OBJ.Mesh(ghostMesh);
    // create vertex buffer
    objectMesh.vertexBuffer = gl.createBuffer();
    // index buffer
    objectMesh.indexBuffer = gl.createBuffer();

    gl.useProgram(program2);
    gl.bindBuffer(gl.ARRAY_BUFFER, objectMesh.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectMesh.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, objectMesh.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectMesh.indices), gl.STATIC_DRAW);


    let s45 = 0.707106781186548;
    let gLightDir1 = [ 0.0, s45, s45, 1.0];
    gl.uniform4f(program2.light, gLightDir1[0], gLightDir1[1], gLightDir1[2], gLightDir1[3]);
    let colors = [1, 0, 0]
    gl.uniform4f(program2.matcol, colors[0], colors[1], colors[2], 1.0);

    //##############################################################
    // update W matrix

    var worldMatrix = utils.MakeWorld(sliderValuex,sliderValuey,sliderValuez,worldAnglex,worldAngley,worldAnglez,1);
    //##############################################################
    //here we need to put the transforms: local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
    var wvpMatrix_1 = utils.multiplyMatrices(projectionMatrix, viewMatrix); // for program 1, used by plane and axis
    var wvpMatrix_2 = utils.multiplyMatrices(wvpMatrix_1, worldMatrix); // for program 2 used by ghost

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = model.model.indices.length;


    gl.uniformMatrix4fv(program2.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix_2));
    gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
}


function drawAxisLines(){
    gl.useProgram(program);
    var wvpMatrix_1 = utils.multiplyMatrices(projectionMatrix, viewMatrix); // for program 1, used by plane and axis
    gl.uniformMatrix4fv(program.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix_1));

    var lines = [
        0,0,0,
        10,0,0,
        0,0,0,
        0,10,0,
        0,0,0,
        0,0,10,
    ]
    var lineBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, lines.length/3);
}


function drawYplane(){
    var wvpMatrix_1 = utils.multiplyMatrices(projectionMatrix, viewMatrix); // for program 1, used by plane and axis
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix_1));
    var plane = [
        -10,0,-10,
        -10,0,10,
        10,0,-10,
        10,0,-10,
        -10,0,10,
        10,0,10,
    ]
    var planeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, plane.length/3);
}


function drawModel(model, worldMatrix){
    gl.useProgram(program2);
    // do buffers and data for every model
    // create vertex buffer
    // let vertexBuffer = gl.createBuffer();
    // // index buffer
    // let indexBuffer = gl.createBuffer();
    // console.log(model)
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectMesh.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectMesh.indices), gl.STATIC_DRAW);


    let s45 = 0.707106781186548;
    let gLightDir1 = [ 0.0, s45, s45, 1.0];
    gl.uniform4f(program2.light, gLightDir1[0], gLightDir1[1], gLightDir1[2], gLightDir1[3]);
    let colors = [1, 0, 0]
    gl.uniform4f(program2.matcol, colors[0], colors[1], colors[2], 1.0);

    //##############################################################
    // update W matrix

    // var worldMatrix = utils.MakeWorld(sliderValuex,sliderValuey,sliderValuez,worldAnglex,worldAngley,worldAnglez,1);
    //##############################################################
    //here we need to put the transforms: local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
    var wvpMatrix_1 = utils.multiplyMatrices(projectionMatrix, viewMatrix); // for program 1, used by plane and axis
    var wvpMatrix_2 = utils.multiplyMatrices(wvpMatrix_1, worldMatrix); // for program 2 used by ghost

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = model.model.indices.length;


    gl.uniformMatrix4fv(program2.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix_2));
    gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
}


function drawSphere(){
    // Draws a Sphere --- To do for the assignment.
	let res = 9
	let r = 9
	let start_x = -2;
	let end_x = 2;
	let start_z = -2;
	let end_z = 2;
	let size_x = (end_x - start_x) / res
	let size_z = (end_z - start_z) / res
	let index = 0
	///// Creates vertices
	var vert5 = [];

	for(y = -90; y <= 90; y += 180/r){
		h = Math.sin(y/180*Math.PI)
		radius = Math.cos(y/180*Math.PI)
		for(a = 0; a < 360; a += 360/r){
			
			x = Math.cos(a/180*Math.PI)*radius
			z = Math.sin(a/180*Math.PI)*radius
			let n1 = Math.cos(a/180*Math.PI) * Math.cos(y/180*Math.PI)**2;
			let n2 = Math.sin(y/180*Math.PI) * Math.cos(y/180*Math.PI);
			let n3 = Math.cos(y/180*Math.PI)**2 * Math.sin(a/180*Math.PI);
			let size = Math.sqrt(n1**2 + n2**2 + n3**2);

			vert5[index] = [x, h, z, n1/size, n2/size, n3/size];
			index ++;
		}
		// if(y===0){break;}
	}
	// console.log(vert5)
	////// Creates indices
	var ind5 = [];
	// t = 360/res
	t = r
	for(i = 0; i < r; i ++) {
		for(j = 0; j < t; j ++) {
			ind5[i*t**2 + j*t + 0] = i*t + j;
			ind5[i*t**2 + j*t + 2] = i*t + (j+1)%t;
			ind5[i*t**2 + j*t + 1] = i*t + j+(t+0);

			ind5[i*t**2 + j*t + 3] = i*t + (j+1)%t;
			ind5[i*t**2 + j*t + 4] = i*t + j+t;
			ind5[i*t**2 + j*t + 5] = i*t + (j+1)%t+t;
		}
	}


    // make proper vertex and index arrays
    let vertices = [];
    let indices = [];
    let totMesh = 0;
    let startVertex = [0];
    let startIndex = [0];
    for(i = 0; i < vert5.length; i++) {
		vertices[(i + startVertex[totMesh]) * 3 + 0 ] = vert5[i][0];
		vertices[(i + startVertex[totMesh]) * 3 + 1 ] = vert5[i][1];
		vertices[(i + startVertex[totMesh]) * 3 + 2 ] = vert5[i][2];
	}
	for(i = 0; i < ind5.length; i++) {
		indices[i + startIndex[totMesh]] = startVertex[totMesh] + ind5[i];
	}
	totMesh ++;	
    startVertex[totMesh] = startVertex[totMesh-1] + vert5.length;
	startIndex[totMesh] = startIndex[totMesh-1] + ind5.length;
    let ret = {};
    ret.vertices = vertices;
    ret.indices = indices; 
    return ret;
}


function createTriangle(){
    let ret = {};
    ret.vertices = [-1, 0, 0,
                    0, 0, -1,
                    0, 0, 0];
    ret.indices = [0, 2, 1, 0, 1, 2];
    return ret;
}