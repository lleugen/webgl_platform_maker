"use strict";




var gl = null;
var program = null;
var program2 = null;

var objectMesh = null;




var lookRadius = 5
var elevation = -15.0;
var angle = 0.0;
var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
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
		
		if((dx != 0) || (dy != 0)) {
			angle = angle + 0.5 * dx;
			elevation = elevation + 0.5 * dy;
		}
	}
}

function main() {
    // Get A WebGL context
    var canvas = document.querySelector("#canvas");
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    console.log(canvas)
    gl = canvas.getContext("webgl2");
    if (!gl) {
      return;
    }
    const ext = gl.getExtension('GMAN_debug_helper');
    // Get the strings for our GLSL shaders
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
    var vertexShaderSource_2 = document.querySelector("#vertex-shader-2d_2").text;
    var fancyFragmentShaderSource = document.querySelector("#fancyFragmentShader").text;
    // create GLSL shaders, upload the GLSL source, compile the shaders
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var vertexShader_2 = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource_2);
    var fancyFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fancyFragmentShaderSource);

    // Link the two shaders into a program
    program2 = createProgram(gl, vertexShader_2, fancyFragmentShader);

    program = createProgram(gl, vertexShader_2, fragmentShader);
    program.projection_uniform_location = gl.getUniformLocation(program, "projection");
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program2);
    //find attribute locations
    program2.projection_uniform_location = gl.getUniformLocation(program2, "projection");
    
    

    // code above this line is initialization code.
    // code below this line is rendering code.

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    

//#####################################################################################
    objectMesh = new OBJ.Mesh(ghostMesh);
    // OBJ.initMeshBuffers(gl, ghostMesh);
    objectMesh.vertexBuffer = gl.createBuffer();
    ext.tagObject(objectMesh.vertexBuffer, 'objectMesh.vertexBuffer');
    // do vertex buffer
		program2.vertexPositionAttribute = gl.getAttribLocation(program2, "a_position");
		gl.enableVertexAttribArray(program2.vertexPositionAttribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, objectMesh.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectMesh.vertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    // index buffer
    objectMesh.indexBuffer = gl.createBuffer();
    ext.tagObject(objectMesh.indexBuffer, "objectMesh.indexBuffer");
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, objectMesh.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectMesh.indices), gl.STATIC_DRAW);
    console.log((objectMesh.vertices.length))

//#####################################################################################
    program2.light = gl.getUniformLocation(program2, "light");
    let s45 = 0.707106781186548;
    let gLightDir1 = [ 0.0, s45, s45, 1.0];
    gl.uniform4f(program2.light, gLightDir1[0], gLightDir1[1], gLightDir1[2], gLightDir1[3]);

    program2.matcol = gl.getUniformLocation(program2, "matcol");
    let colors = [1, 0, 0]
    gl.uniform4f(program2.matcol, colors[0], colors[1], colors[2], 1.0);
    // var positions2 = [
    //   0, 0, -2,
    //   1, 0, -2,
    //   0, 1, -2,
    //   0, 0, 0,
    //   0, 1, 0,
    //   -1, 0, 0,
    //   0, 0, 1,
    //   0, 1, 1,
    //   -1, 0, 1,
    // ];
    

    // // look up where the vertex data needs to go.
    // var positionAttributeLocation = gl.getAttribLocation(program2, "a_position");
    // // Turn on the attribute
    // gl.enableVertexAttribArray(positionAttributeLocation);
    // // Create a buffer and put three 2d clip space points in it
    // var positionBuffer = gl.createBuffer();
    // // // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions2), gl.STATIC_DRAW);

    // // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    // var size = 3;          // 2 components per iteration
    // var type = gl.FLOAT;   // the data is 32bit floats
    // var normalize = false; // don't normalize the data
    // var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    // var offset = 0;        // start at the beginning of the buffer
    // gl.vertexAttribPointer(
    //     positionAttributeLocation, size, type, normalize, stride, offset);
    gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);  
    draw();
  }



function draw(){
  gl.useProgram(program2);
  gl.bindBuffer(gl.ARRAY_BUFFER, objectMesh.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectMesh.vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  // update WV matrix
	// let cz = 10 * Math.cos(utils.degToRad(-cameraAngle)) * Math.cos(utils.degToRad(-cameraElevation));
	// let cx = 10 * Math.sin(utils.degToRad(-cameraAngle)) * Math.cos(utils.degToRad(-cameraElevation));
	// let cy = 10 * Math.sin(utils.degToRad(-cameraElevation));
	let viewMatrix = utils.MakeView(sliderValuex, sliderValuey, sliderValuez, cameraElevation, -cameraAngle);
  var worldMatrix = utils.MakeWorld(0,0,2,worldAnglex,worldAngley,worldAnglez,1);

  // Make an isometric view
  if(projectionType == "orthogonal"){
    let w = cameraWindowWidth;
    let a = 2;
    let n = nearPlane;
    let f = farPlane;
    let orthogonal_projection =  [1/w,	0.0,		0.0,		0.0,
                            0.0,		a/w,		0.0,		0.0,
                            0.0,		0.0,		-2/(f-n),		-(f+n)/(f-n),
                            0.0,		0.0,		0.0,		1.0];
    var projectionMatrix = orthogonal_projection;
  }
  if(projectionType == "isometric"){
    let w = cameraWindowWidth;
    let a = 2;
    let n = nearPlane;
    let f = farPlane;
    let orthogonal_projection =  [1/w,	0.0,		0.0,		0.0,
                            0.0,		a/w,		0.0,		0.0,
                            0.0,		0.0,		-2/(f-n),		-(f+n)/(f-n),
                            0.0,		0.0,		0.0,		1.0];
    let cos_45 = Math.cos(45/180*Math.PI)
    let sin_45 = Math.sin(45/180*Math.PI)
    let cos_35 = Math.cos(-35.26/180*Math.PI)
    let sin_35 = Math.sin(-35.26/180*Math.PI)
    let x_rotation = [1, 0, 0, 0,
              0, cos_35, sin_35, 0,
              0, -sin_35, cos_35, 0,
              0, 0, 0, 1];
    
    let y_rotation = [cos_45, 0, sin_45, 0,
              0, 1, 0, 0,
              -sin_45, 0, cos_45, 0,
              0, 0, 0, 1];
    var A1 =  utils.multiplyMatrices(orthogonal_projection, x_rotation)
    var projectionMatrix = utils.multiplyMatrices(A1, y_rotation)
  }
  if(projectionType == "perspective"){
    var projectionMatrix = utils.MakePerspective(60,2,nearPlane,farPlane);
  }

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = objectMesh.indices.length;
  
  //here we need to put the transforms: local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
  var wvpMatrix = utils.multiplyMatrices(worldMatrix, projectionMatrix)
  var wvpMatrix = utils.multiplyMatrices(wvpMatrix, viewMatrix);

  //##############################################################
  var perspProjectionMatrix = utils.MakePerspective(65, canvas.width / canvas.height, 0.1, 100.0)

	// update WV matrix
	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
	projectionMatrix = utils.multiplyMatrices(perspProjectionMatrix, viewMatrix);
  //##############################################################

  gl.uniformMatrix4fv(program2.projection_uniform_location, false, utils.transposeMatrix(projectionMatrix));
  gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, 0);

  // var worldMatrix = utils.MakeWorld(0,0,-2,worldAnglex,worldAngley,worldAnglez,1);
  // var wvpMatrix = utils.multiplyMatrices(worldMatrix, projectionMatrix)
  // var wvpMatrix = utils.multiplyMatrices(wvpMatrix, viewMatrix);
  // gl.uniformMatrix4fv(program2.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix));
  // gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, 0);

  // drawAxisLines();
  // drawYplane();
  // gl.drawArrays(primitiveType, offset, count);
  window.requestAnimationFrame(draw);






  function drawAxisLines(){
  
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
    gl.useProgram(program);

    gl.uniformMatrix4fv(program.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix));
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
}





function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

var sliderValuex = 1;
function onSliderChangex(value){
    console.log("Slider value changed to "+value);
    sliderValuex = value;
}
var sliderValuey = 1;
function onSliderChangey(value){
    console.log("Slider value changed to "+value);
    sliderValuey = value;
}
var sliderValuez = 1;
function onSliderChangez(value){
    console.log("Slider value changed to "+value);
    sliderValuez = value;
}
var nearPlane = 1;
function onSliderChangeNear(value){
    console.log("Slider value changed to "+value);
    nearPlane = value;
}
var farPlane = 10;
function onSliderChangeFar(value){
    console.log("Slider value changed to "+value);
    farPlane = value;
}
var cameraWindowWidth = 5;
function onSliderChangew(value){
    console.log("Slider value changed to "+value);
    cameraWindowWidth = value;
}
var cameraElevation = 0;
function onSliderChangeElevation(value){
    console.log("Slider value changed to "+value);
    cameraElevation = value;
}
var cameraAngle = 0;
function onSliderChangeAngle(value){
    console.log("Slider value changed to "+value);
    cameraAngle = value;
}

var projectionType = "orthogonal";
function onRadioButtonChange(value){
  console.log("Radio button value changed to "+value);
  projectionType = value;
}

var worldAnglex = 0;
function onSliderChangeWorldAnglex(value){
    console.log("Slider value changed to "+value);
    worldAnglex = value;
}
var worldAngley = 0;
function onSliderChangeWorldAngley(value){
    console.log("Slider value changed to "+value);
    worldAngley = value;
}
var worldAnglez = 0;
function onSliderChangeWorldAnglez(value){
    console.log("Slider value changed to "+value);
    worldAnglez = value;
}




main();