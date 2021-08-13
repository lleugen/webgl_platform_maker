"use strict";
function main() {
  loadShaders();
  loadModels();
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
  // todo make program for every model
  program2 = createProgram(gl, vertexShader_2, fancyFragmentShader);
  ext.tagObject(program2, "program2");
  program = createProgram(gl, vertexShader, fragmentShader);
  ext.tagObject(program, "program");
  // get uniform locations inside the programs 
  program.projection_uniform_location = gl.getUniformLocation(program, "projection");
  program.vertexPositionAttribute = gl.getAttribLocation(program, "a_position");
  program2.projection_uniform_location = gl.getUniformLocation(program2, "projection");
  program2.worldUniformLocation = gl.getUniformLocation(program2, "u_world");
  program2.reverseLightLocation = gl.getUniformLocation(program2, "u_reverseLightDirection")  
  program2.vertexPositionAttribute = gl.getAttribLocation(program2, "a_position");
  program2.normalPositionAttribute = gl.getAttribLocation(program2, "in_normal");
  gl.enableVertexAttribArray(program2.vertexPositionAttribute);
  gl.enableVertexAttribArray(program.vertexPositionAttribute);
  gl.enableVertexAttribArray(program2.normalPositionAttribute);
  // program2.light = gl.getUniformLocation(program2, "light");
  program2.matcol = gl.getUniformLocation(program2, "matcol");
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // add model created buffers and puts the data inside, it need to have the locations already set
  var brick = new OBJ.Mesh(brickStr);
  var cloud = new OBJ.Mesh(cloudStr);
  var cylinder = new OBJ.Mesh(cylinderStr);
  var hedge = new OBJ.Mesh(hedgeStr);
  var mountain = new OBJ.Mesh(mountainStr);
  var rock = new OBJ.Mesh(rockStr);
  var square = new OBJ.Mesh(squareStr);
  var tree = new OBJ.Mesh(treeStr);
  var ghost = new OBJ.Mesh(ghostStr);
  inputElementsManager = new InputElementsManager();
  renderer = new Renderer();

  renderer.addModel('tree', tree, program2);
  renderer.addModel('hedge', hedge, program2);
  renderer.addModel('rock', rock, program2);
  renderer.addModel('brick', brick, program2);
  renderer.addModel('cloud', cloud, program2);
  renderer.addModel('cylinder', cylinder, program2);
  renderer.addModel('mountain', mountain, program2);
  renderer.addModel('square', square, program2);
  renderer.addModel('sphere', createSphere(), program2);
  renderer.addModel('triangle', createTriangle(), program2);
  renderer.addModel('ghost', ghost, program2);
  // Clear the canvas: when should this be done? probably in the drawing loop, but it works even without clearing
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  renderer.draw();
}








async function loadModels(){
  await utils.loadFiles(['assets/brick.obj', 'assets/cloud.obj', 'assets/cylinderIsland.obj', 'assets/hedge.obj', 
  'assets/mountain.obj', 'assets/rock.obj', 'assets/squareIsland.obj', 'assets/tree.obj', 'assets/ghost.obj'], function (meshText) {
    brickStr = meshText[0];
    cloudStr = meshText[1];
    cylinderStr = meshText[2];
    hedgeStr = meshText[3];
    mountainStr = meshText[4];
    rockStr = meshText[5];
    squareStr = meshText[6];
    treeStr = meshText[7];
    ghostStr = meshText[8];
    objectStrings = meshText;
  });
}


async function loadShaders(){
  await utils.loadFiles(['shaders/vertex-shader-2d.glsl',
                        'shaders/vertex-shader-2d_2.glsl',
                        'shaders/axisFragmentShader.glsl',
                        'shaders/fancyFragmentShader.glsl'], function (shaderText) {
    vertexShaderSource = shaderText[0];
    vertexShaderSource_2 = shaderText[1];
    fragmentShaderSource = shaderText[2];
    fancyFragmentShaderSource = shaderText[3];
  });
}