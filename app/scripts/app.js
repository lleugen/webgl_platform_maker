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
  
  // create shaders from sources loaded above
  let axisFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, axisFragmentShaderSource);
  let uniformLightVertexShader = createShader(gl, gl.VERTEX_SHADER, uniformLightVertexShaderSource);
  let axisVertexShader = createShader(gl, gl.VERTEX_SHADER, axisVertexShaderSource);
  let uniformLightFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, uniformLightFragmentShaderSource);
  // console.log(pointLightFragmentShaderSource);
  let pointLightVertexShader = createShader(gl, gl.VERTEX_SHADER, pointLightVertexShaderSource);
  let pointLightFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, pointLightFragmentShaderSource);
  // create programs with a vertex shader and a fragment shader
  // tag the programs with a name so the linter can tell us where errors come from
  // todo make program for every model
  program2 = createProgram(gl, uniformLightVertexShader, uniformLightFragmentShader);
  program = createProgram(gl, axisVertexShader, axisFragmentShader);
  program3 = createProgram(gl, pointLightVertexShader, pointLightFragmentShader);
  programs.push(program);
  programs.push(program2);
  programs.push(program3);
  if(useLinter){
    ext = gl.getExtension('GMAN_debug_helper');
    ext.tagObject(program2, "program2");
    ext.tagObject(program, "program");
  }
  
  getLocations();

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
  renderer.addModel('F', createF(), program2);
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
  await utils.loadFiles(['shaders/axisVertexShader.glsl',
                        'shaders/uniformLightVertexShader.glsl',
                        'shaders/axisFragmentShader.glsl',
                        'shaders/uniformLightFragmentShader.glsl',
                      'shaders/pointLightVertexShader.glsl',
                    'shaders/pointLightFragmentShader.glsl'], function (shaderText) {
    axisVertexShaderSource = shaderText[0];
    uniformLightVertexShaderSource = shaderText[1];
    axisFragmentShaderSource = shaderText[2];
    uniformLightFragmentShaderSource = shaderText[3];
    pointLightVertexShaderSource = shaderText[4];
    pointLightFragmentShaderSource = shaderText[5];
  });
}


function getLocations(){
  // get uniform locations inside the programs 
  program.projection_uniform_location = gl.getUniformLocation(program, "projection");
  program.vertexPositionAttribute = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program2.u_worldViewProjectionMatrix = gl.getUniformLocation(program2, "u_worldViewProjectionMatrix");
  program2.u_inverseTransposeWorldMatrix = gl.getUniformLocation(program2, "u_inverseTransposeWorldMatrix");
  program2.u_reverseLightDirection = gl.getUniformLocation(program2, "u_reverseLightDirection")
  program2.u_color = gl.getUniformLocation(program2, "u_color");
  program2.u_worldMatrix = gl.getUniformLocation(program2, "u_worldMatrix");
  program2.u_lightWorldPosition = gl.getUniformLocation(program2, "u_lightWorldPosition");
  program2.u_cameraWorldPosition = gl.getUniformLocation(program2, "u_cameraWorldPosition");
  program2.u_uniformLightColor = gl.getUniformLocation(program2, "u_uniformLightColor");
  program2.u_pointLightColor = gl.getUniformLocation(program2, "u_pointLightColor");
  program2.u_spotlightDirection = gl.getUniformLocation(program2, "u_spotlightDirection");
  program2.u_spotlightInnerLimit = gl.getUniformLocation(program2, "u_spotlightInnerLimit");
  program2.u_spotlightOuterLimit = gl.getUniformLocation(program2, "u_spotlightOuterLimit");
  program2.u_spotlightPosition = gl.getUniformLocation(program2, "u_spotlightPosition");


  program3.u_worldMatrix = gl.getUniformLocation(program3, "u_worldMatrix");
  program3.u_lightWorldPosition = gl.getUniformLocation(program3, "u_lightWorldPosition");
  program3.u_worldViewProjectionMatrix = gl.getUniformLocation(program3, "u_worldViewProjectionMatrix");
  program3.u_inverseTransposeWorldMatrix = gl.getUniformLocation(program3, "u_inverseTransposeWorldMatrix");
  program3.u_color = gl.getUniformLocation(program3, "u_color");
  
  program2.a_position = gl.getAttribLocation(program2, "a_position");
  program2.a_normal = gl.getAttribLocation(program2, "a_normal");
  gl.enableVertexAttribArray(program2.a_position);
  gl.enableVertexAttribArray(program2.a_normal);

  program3.a_position = gl.getAttribLocation(program3, "a_position");
  program3.a_normal = gl.getAttribLocation(program3, "a_normal");
  gl.enableVertexAttribArray(program2.a_position);
  gl.enableVertexAttribArray(program2.a_normal);

  
  
  // program2.a_position = gl.getAttribLocation(program2, "a_position");
  // program2.a_normal = gl.getAttribLocation(program2, "a_normal");
  // program2.u_worldViewProjection = gl.getUniformLocation(program2, "u_worldViewProjection");
  // program2.u_worldInverseTranspose = gl.getUniformLocation(program2, "u_worldInverseTranspose");
  // program2.u_reverseLightDirection = gl.getUniformLocation(program2, "u_reverseLightDirection");
  // program2.u_color = gl.getUniformLocation(program2, "u_color");
  

}