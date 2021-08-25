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
  let simpleVertexShader = createShader(gl, gl.VERTEX_SHADER, simpleVertexShaderSource);
  let simpleFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, simpleFragmentShaderSource);
  // create programs with a vertex shader and a fragment shader
  // tag the programs with a name so the linter can tell us where errors come from
  // todo make program for every model
  program2 = createProgram(gl, uniformLightVertexShader, uniformLightFragmentShader);
  program = createProgram(gl, axisVertexShader, axisFragmentShader);
  // program3 = createProgram(gl, pointLightVertexShader, pointLightFragmentShader);
  simpleProgram = createProgram(gl, simpleVertexShader, simpleFragmentShader);
  programs.push(program);
  programs.push(program2);
  programs.push(program3);
  programs.push(simpleProgram);
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
  loadTexture("./assets/Terrain-Texture_2.png");
  loadTexture("./assets/cloud2.png");
  loadTexture("./assets/brick1.png");




  renderer.addModel('tree', tree, program2);
  renderer.addModel('hedge', hedge, program2);
  renderer.addModel('rock', rock, program2);
  renderer.addModel('brick', brick, program2, 2);
  renderer.addModel('cloud', cloud, program2, 1);
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

  renderer.camera.view();
  renderer.camera.createProjection(projectionType);

  

  renderer.newFrame();
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
                    'shaders/pointLightFragmentShader.glsl',
                  'shaders/simpleVertexShader.glsl',
                'shaders/simpleFragmentShader.glsl'], function (shaderText) {
    axisVertexShaderSource = shaderText[0];
    uniformLightVertexShaderSource = shaderText[1];
    axisFragmentShaderSource = shaderText[2];
    uniformLightFragmentShaderSource = shaderText[3];
    pointLightVertexShaderSource = shaderText[4];
    pointLightFragmentShaderSource = shaderText[5];
    simpleVertexShaderSource = shaderText[6];
    simpleFragmentShaderSource = shaderText[7];
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
  program2.u_texture = gl.getUniformLocation(program2, "u_texture");
  program2.u_lightViewProjectionTextureMatrix = gl.getUniformLocation(program2, "u_lightViewProjectionTextureMatrix");
  program2.u_depthTexture = gl.getUniformLocation(program2, "u_depthTexture");


  program2.a_position = gl.getAttribLocation(program2, "a_position");
  program2.a_normal = gl.getAttribLocation(program2, "a_normal");
  program2.a_textureCoordinates = gl.getAttribLocation(program2, "a_textureCoordinates");
  gl.enableVertexAttribArray(program2.a_position);
  gl.enableVertexAttribArray(program2.a_normal);
  gl.enableVertexAttribArray(program2.a_textureCoordinates);

  // program3.u_worldMatrix = gl.getUniformLocation(program3, "u_worldMatrix");
  // program3.u_lightWorldPosition = gl.getUniformLocation(program3, "u_lightWorldPosition");
  // program3.u_worldViewProjectionMatrix = gl.getUniformLocation(program3, "u_worldViewProjectionMatrix");
  // program3.u_inverseTransposeWorldMatrix = gl.getUniformLocation(program3, "u_inverseTransposeWorldMatrix");
  // program3.u_color = gl.getUniformLocation(program3, "u_color");
  
  

  // program3.a_position = gl.getAttribLocation(program3, "a_position");
  // program3.a_normal = gl.getAttribLocation(program3, "a_normal");
  // gl.enableVertexAttribArray(program2.a_position);
  // gl.enableVertexAttribArray(program2.a_normal);

  
  
  // program2.a_position = gl.getAttribLocation(program2, "a_position");
  // program2.a_normal = gl.getAttribLocation(program2, "a_normal");
  // program2.u_worldViewProjection = gl.getUniformLocation(program2, "u_worldViewProjection");
  // program2.u_worldInverseTranspose = gl.getUniformLocation(program2, "u_worldInverseTranspose");
  // program2.u_reverseLightDirection = gl.getUniformLocation(program2, "u_reverseLightDirection");
  // program2.u_color = gl.getUniformLocation(program2, "u_color");
  
  simpleProgram.u_worldViewProjectionMatrix = gl.getUniformLocation(simpleProgram, "u_worldViewProjectionMatrix");
  simpleProgram.u_inverseTransposeWorldMatrix = gl.getUniformLocation(simpleProgram, "u_inverseTransposeWorldMatrix");
  simpleProgram.u_reverseLightDirection = gl.getUniformLocation(simpleProgram, "u_reverseLightDirection")
  simpleProgram.u_color = gl.getUniformLocation(simpleProgram, "u_color");
  simpleProgram.u_worldMatrix = gl.getUniformLocation(simpleProgram, "u_worldMatrix");
  simpleProgram.u_lightWorldPosition = gl.getUniformLocation(simpleProgram, "u_lightWorldPosition");
  simpleProgram.u_cameraWorldPosition = gl.getUniformLocation(simpleProgram, "u_cameraWorldPosition");
  simpleProgram.u_uniformLightColor = gl.getUniformLocation(simpleProgram, "u_uniformLightColor");
  simpleProgram.u_pointLightColor = gl.getUniformLocation(simpleProgram, "u_pointLightColor");
  simpleProgram.u_spotlightDirection = gl.getUniformLocation(simpleProgram, "u_spotlightDirection");
  simpleProgram.u_spotlightInnerLimit = gl.getUniformLocation(simpleProgram, "u_spotlightInnerLimit");
  simpleProgram.u_spotlightOuterLimit = gl.getUniformLocation(simpleProgram, "u_spotlightOuterLimit");
  simpleProgram.u_spotlightPosition = gl.getUniformLocation(simpleProgram, "u_spotlightPosition");
  simpleProgram.u_texture = gl.getUniformLocation(simpleProgram, "u_texture");

  simpleProgram.a_position = gl.getAttribLocation(simpleProgram, "a_position");
  simpleProgram.a_normal = gl.getAttribLocation(simpleProgram, "a_normal");
  simpleProgram.a_textureCoordinates = gl.getAttribLocation(simpleProgram, "a_textureCoordinates");
  gl.enableVertexAttribArray(simpleProgram.a_position);
  // gl.enableVertexAttribArray(simpleProgram.a_normal);
  // gl.enableVertexAttribArray(simpleProgram.a_textureCoordinates);
}


async function loadTexture(pathToTextureImage){

  // Create a texture.
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
  
  let textureImage = new Image();
  textureImage.src = pathToTextureImage;

  textureImage.addEventListener('load', function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, textureImage);
      gl.generateMipmap(gl.TEXTURE_2D);
  });

  renderer.textures.push(texture);


  // renderer.textureCloud = gl.createTexture();
  // gl.bindTexture(gl.TEXTURE_2D, renderer.textureCloud);
  
  // // Fill the texture with a 1x1 blue pixel.
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
  //                 new Uint8Array([0, 0, 255, 255]));
  
  // // Asynchronously load an image
  // textureImageCloud = new Image();
  // // textureImage.src = "./assets/Terrain-Texture_2.png";
  // textureImageCloud.src = "./assets/cloud2.png";

  // textureImageCloud.addEventListener('load', function() {
  //     // Now that the image has loaded make copy it to the texture.
  //     gl.bindTexture(gl.TEXTURE_2D, renderer.textureCloud);
  //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, textureImageCloud);
  //     gl.generateMipmap(gl.TEXTURE_2D);
  // });
}