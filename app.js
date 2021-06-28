"use strict";

var gl = null;
var program = null;
var program2 = null;

var objectMesh = null;

function main() {
    // Get A WebGL context
    var canvas = document.querySelector("#canvas");
    console.log(canvas)
    gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }
    // Get the strings for our GLSL shaders
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
    var vertexShaderSource_2 = document.querySelector("#vertex-shader-2d_2").text;
    // create GLSL shaders, upload the GLSL source, compile the shaders
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var vertexShader_2 = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource_2);
    // Link the two shaders into a program
    program2 = createProgram(gl, vertexShader_2, fragmentShader);
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
    // objectMesh = new OBJ.Mesh(ghostMesh);
    // // OBJ.initMeshBuffers(gl, ghostMesh);
    // objectMesh.vertexBuffer = gl.createBuffer();

    // // links mesh attributes to shader attributes
		// program2.vertexPositionAttribute = gl.getAttribLocation(program2, "a_position");
		// gl.enableVertexAttribArray(program2.vertexPositionAttribute);

    // gl.bindBuffer(gl.ARRAY_BUFFER, objectMesh.vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectMesh.vertices), gl.STATIC_DRAW);
		// gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
//#####################################################################################

    var positions2 = [
      0, 0, -2,
      1, 0, -2,
      0, 1, -2,
      0, 0, 0,
      0, 1, 0,
      -1, 0, 0,
      0, 0, 1,
      0, 1, 1,
      -1, 0, 1,
    ];
    

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program2, "a_position");
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();
    // // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions2), gl.STATIC_DRAW);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);
        
    draw();
  }



function draw(){
  
  // update WV matrix
	// let cz = 10 * Math.cos(utils.degToRad(-cameraAngle)) * Math.cos(utils.degToRad(-cameraElevation));
	// let cx = 10 * Math.sin(utils.degToRad(-cameraAngle)) * Math.cos(utils.degToRad(-cameraElevation));
	// let cy = 10 * Math.sin(utils.degToRad(-cameraElevation));
	let viewMatrix = utils.MakeView(sliderValuex, sliderValuey, sliderValuez, cameraElevation, -cameraAngle);
  // var worldMatrix = utils.MakeWorld(0,0,0,sliderValuex,sliderValuey,sliderValuez,1);
  // var projectionMatrix = utils.MakePerspective(60,2,nearPlane,farPlane);

  // Make an isometric view
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
  let projectionMatrix = utils.multiplyMatrices(A1, y_rotation)
  projectionMatrix = orthogonal_projection;
  //make perspective view
  // let projectionMatrix = utils.MakePerspective(65, canvas.width / canvas.height, nearPlane, farPlane)

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 3 //gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
  
  //here we need to put the transforms: local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
  var projection_matrix_uniform = utils.multiplyMatrices(projectionMatrix, viewMatrix);

  gl.uniformMatrix4fv(program2.projection_uniform_location, false, utils.transposeMatrix(projection_matrix_uniform));
  gl.drawArrays(primitiveType, offset, count);
  window.requestAnimationFrame(draw);
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




main();