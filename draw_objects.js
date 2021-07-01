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
    var count = objectMesh.indices.length;


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

function drawModel(objectMesh, worldMatrix){
    gl.useProgram(program2);
    // create vertex buffer
    objectMesh.vertexBuffer = gl.createBuffer();
    // index buffer
    objectMesh.indexBuffer = gl.createBuffer();
    
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

    // var worldMatrix = utils.MakeWorld(sliderValuex,sliderValuey,sliderValuez,worldAnglex,worldAngley,worldAnglez,1);
    //##############################################################
    //here we need to put the transforms: local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
    var wvpMatrix_1 = utils.multiplyMatrices(projectionMatrix, viewMatrix); // for program 1, used by plane and axis
    var wvpMatrix_2 = utils.multiplyMatrices(wvpMatrix_1, worldMatrix); // for program 2 used by ghost

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = objectMesh.indices.length;


    gl.uniformMatrix4fv(program2.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix_2));
    gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
}