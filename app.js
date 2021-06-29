"use strict";
var gl = null;
var canvas = null;
var program = null;
var program2 = null;
var objectMesh = null;

var vertexShaderSource;
var vertexShaderSource_2;
var fragmentShaderSource;
var fancyFragmentShaderSource;

var vertexShader;
var vertexShader_2;
var fragmentShader;
var fancyFragmentShader;

var viewMatrix;
var projectionMatrix;

var brickStr;
var cloudStr;
var cylinderStr;
var hedgeStr;
var mountainStr;
var rockStr;
var squareStr;
var treeStr;




async function loadShaders(){
  await utils.loadFiles(['assets/brick.obj', 'assets/cloud.obj', 'assets/cylinderIsland.obj', 'assets/hedge.obj', 
  'assets/mountain.obj', 'assets/rock.obj', 'assets/squareIsland.obj', 'assets/tree.obj'], function (meshText) {
    brickStr = meshText[0];
    cloudStr = meshText[1];
    cylinderStr = meshText[2];
    hedgeStr = meshText[3];
    mountainStr = meshText[4];
    rockStr = meshText[5];
    squareStr = meshText[6];
    treeStr = meshText[7];
  });
}
loadShaders();

async function loadModels(){
  await utils.loadFiles(['vertex-shader-2d.glsl', 'vertex-shader-2d_2.glsl', 'fragment-shader-2d.glsl', 'fancyFragmentShader.glsl'], function (shaderText) {
    vertexShaderSource = shaderText[0];
    vertexShaderSource_2 = shaderText[1];
    fragmentShaderSource = shaderText[2];
    fancyFragmentShaderSource = shaderText[3];
  });
}
loadModels();



function main() {
    canvas = document.querySelector("#canvas");
    // add input event listeners to the canvas, functions are defined in input_events.js
    addListeners(canvas);
    // get webgl2 context, we must use webgl2 in order to have glsl 300 es version
    gl = canvas.getContext("webgl2");
    if (!gl) {
      return;
    }
    // this is a linter which helps to get more information when errors occur
    const ext = gl.getExtension('GMAN_debug_helper');

    // create shaders from sources loaded above
    fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    vertexShader_2 = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource_2);
    vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    fancyFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fancyFragmentShaderSource);
    // create programs with a vertex shader and a fragment shader
    // tag the programs with a name so the linter can tell us where errors come from
    program2 = createProgram(gl, vertexShader_2, fancyFragmentShader);
    ext.tagObject(program2, "program2");
    program = createProgram(gl, vertexShader, fragmentShader);
    ext.tagObject(program, "program");
    // get uniform locations inside the programs 
    program.projection_uniform_location = gl.getUniformLocation(program, "projection");
    program2.projection_uniform_location = gl.getUniformLocation(program2, "projection");
    program2.vertexPositionAttribute = gl.getAttribLocation(program2, "a_position");
		gl.enableVertexAttribArray(program2.vertexPositionAttribute);
    program2.light = gl.getUniformLocation(program2, "light");
    program2.matcol = gl.getUniformLocation(program2, "matcol");
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas: when should this be done? probably in the drawing loop, but it works even without clearing
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    
    gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
    // do the magic
    draw();
  }

function draw(){
  // make view matrix
  cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
  // console.log(cx, cy, cz)
  // viewMatrix = utils.MakeView(6,6,6, elevation, -angle);
  // Make projection matrix
  if(projectionType == "orthogonal"){
    let w = cameraWindowWidth;
    let a = 2;
    let n = nearPlane;
    let f = farPlane;
    let orthogonal_projection =  [1/w,	0.0,		0.0,		0.0,
                            0.0,		a/w,		0.0,		0.0,
                            0.0,		0.0,		-2/(f-n),		-(f+n)/(f-n),
                            0.0,		0.0,		0.0,		1.0];
    projectionMatrix = orthogonal_projection;
  }
  else if(projectionType == "isometric"){
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
    projectionMatrix = utils.multiplyMatrices(A1, y_rotation)
  }
  else if(projectionType == "perspective"){
    // console.log(nearPlane, farPlane)
    projectionMatrix = utils.MakePerspective(45,2,nearPlane,farPlane);
  }

  // draw individual objects, functions defined in draw_objects.js
  drawGhost();
  drawAxisLines();
  // drawYplane();
  
  let worldMatrix
  worldMatrix = utils.MakeWorld(0,0,30,0,0,0,1);
  let mountain = new OBJ.Mesh(mountainStr, worldMatrix);
  drawModel(mountain, worldMatrix);

  worldMatrix = utils.MakeWorld(0,30,0,0,0,0,1);
  let lastUpdateTime = 0
  var currentTime = (new Date).getTime();
  var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
  var curRotation = utils.MakeRotateXYZMatrix(deltaC, -deltaC, deltaC);
  lastUpdateTime = currentTime;
  worldMatrix = utils.multiplyMatrices(worldMatrix, curRotation);

  let cloud_1 = new OBJ.Mesh(cloudStr, worldMatrix);
  drawModel(cloud_1, worldMatrix);
  worldMatrix = utils.MakeWorld(30,35,10,30,0,0,1);
  let cloud_2 = new OBJ.Mesh(cloudStr, worldMatrix);
  drawModel(cloud_2, worldMatrix);
  

  worldMatrix = utils.MakeWorld(0,0,-30,0,0,0,1);
  let cylinder = new OBJ.Mesh(cylinderStr, worldMatrix);
  drawModel(cylinder, worldMatrix);

  worldMatrix = utils.MakeWorld(0,15,0,0,0,0,0.1);
  let brick = new OBJ.Mesh(brickStr, worldMatrix);
  drawModel(brick, worldMatrix);

  let hedge = new OBJ.Mesh(hedgeStr, worldMatrix);
  let i;
  for(i=-5; i<=5; i++){
    worldMatrix = utils.MakeWorld(i*10,0,-50,0,0,0,0.5);
    drawModel(hedge, worldMatrix);
    worldMatrix = utils.MakeWorld(i*10,0,50,0,0,0,0.5);
    drawModel(hedge, worldMatrix);
  }
  for(i=-4; i<5; i++){
    worldMatrix = utils.MakeWorld(50,0,i*10,0,0,0,0.5);
    drawModel(hedge, worldMatrix);
    worldMatrix = utils.MakeWorld(-50,0,i*10,0,0,0,0.5);
    drawModel(hedge, worldMatrix);
  }

  worldMatrix = utils.MakeWorld(30,0,0,0,0,0,1);
  let rock = new OBJ.Mesh(rockStr, worldMatrix);
  drawModel(rock, worldMatrix);

  
  let square = new OBJ.Mesh(squareStr, worldMatrix);
  for(i=-3; i<4; i++){
    worldMatrix = utils.MakeWorld(i*20,-15,0,0,0,0,1);
    drawModel(square, worldMatrix);
  }

  worldMatrix = utils.MakeWorld(-30,0,0,0,0,0,1);
  let tree = new OBJ.Mesh(treeStr, worldMatrix);
  drawModel(tree, worldMatrix);
  
  

  window.requestAnimationFrame(draw);
}

main();