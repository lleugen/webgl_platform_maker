"use strict";
function main() {
  loadShaders();
  loadModels();
  canvas = document.querySelector("#canvas");
  addListeners(canvas);  // defined in input_events.js
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("could not manage to get context, exiting")
    return;
  }
  
  // create shaders from sources loaded above
  let axisFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, axisFragmentShaderSource);
  let uniformLightVertexShader = createShader(gl, gl.VERTEX_SHADER, uniformLightVertexShaderSource);
  let axisVertexShader = createShader(gl, gl.VERTEX_SHADER, axisVertexShaderSource);
  let uniformLightFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, uniformLightFragmentShaderSource);
  let pointLightVertexShader = createShader(gl, gl.VERTEX_SHADER, pointLightVertexShaderSource);
  let pointLightFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, pointLightFragmentShaderSource);
  let simpleVertexShader = createShader(gl, gl.VERTEX_SHADER, simpleVertexShaderSource);
  let simpleFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, simpleFragmentShaderSource);
  let skyboxVertexShader = createShader(gl, gl.VERTEX_SHADER, skyboxVertexShaderSource);
  let skyboxFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, skyboxFragmentShaderSource);
  // create programs with a vertex shader and a fragment shader
  // tag the programs with a name so the linter can tell us where errors come from
  program2 = createProgram(gl, uniformLightVertexShader, uniformLightFragmentShader);
  program = createProgram(gl, axisVertexShader, axisFragmentShader);
  // program3 = createProgram(gl, pointLightVertexShader, pointLightFragmentShader);
  simpleProgram = createProgram(gl, simpleVertexShader, simpleFragmentShader);  // used for rendering the depth map for shadows
  skyboxProgram = createProgram(gl, skyboxVertexShader, skyboxFragmentShader);
  programs.push(program);
  programs.push(program2);
  programs.push(program3);
  programs.push(simpleProgram);
  programs.push(skyboxProgram);
  if(useLinter){
    console.log('using linter')
    ext = gl.getExtension('GMAN_debug_helper');
    ext.tagObject(program2, "program2");
    ext.tagObject(program, "program");
    ext.tagObject(skyboxProgram, "skyboxProgram")
  }
  
  getLocations();

  var brick = new OBJ.Mesh(brickStr);
  var cloud = new OBJ.Mesh(cloudStr);
  var cylinder = new OBJ.Mesh(cylinderStr);
  var hedge = new OBJ.Mesh(hedgeStr);
  var mountain = new OBJ.Mesh(mountainStr);
  var rock = new OBJ.Mesh(rockStr);
  var square = new OBJ.Mesh(squareStr);
  var tree = new OBJ.Mesh(treeStr);
  var ghost = new OBJ.Mesh(ghostStr);

  // input elements manager draws all the buttons on the page
  inputElementsManager = new InputElementsManager();
  // the renderer registers all the objects and models and does the rendering loop
  renderer = new Renderer();
  // load textures and register them in the renderer
  loadTexture("./assets/Terrain-Texture_2.png");
  loadTexture("./assets/cloud animation texture.png");
  loadTexture("./assets/brick1.png");
  // add models (also set vaos for each one)
  renderer.addModel('tree', tree, program2, 0);
  renderer.addModel('hedge', hedge, program2, 0);
  renderer.addModel('rock', rock, program2, 0);
  renderer.addModel('brick', brick, program2, 2);
  renderer.addModel('cloud', cloud, program2, 1);
  renderer.addModel('cylinder', cylinder, program2, 0);
  renderer.addModel('mountain', mountain, program2, 0);
  renderer.addModel('square', square, program2, 0);
  // renderer.addModel('sphere', createSphere(), program2);
  // renderer.addModel('triangle', createTriangle(), program2);
  renderer.addModel('ghost', ghost, program2);
  
  // enable important settings
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // initialize camera
  renderer.camera.view();
  renderer.camera.createProjection(projectionType);

  // setup shadow texture for main uniform light
  depthTexture = gl.createTexture();
  depthTextureSize = 2048;
  gl.activeTexture(gl.TEXTURE0 + depthTextureIndex);
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT32F,depthTextureSize,depthTextureSize,0,gl.DEPTH_COMPONENT,gl.FLOAT,null);              // data
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  depthFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,depthTexture,0);

  // setup shadow texture for secondary uniform light
  depthTexture2 = gl.createTexture();
  depthTextureSize = 2048;
  gl.activeTexture(gl.TEXTURE0 + depthTextureIndex2);
  gl.bindTexture(gl.TEXTURE_2D, depthTexture2);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT32F,depthTextureSize,depthTextureSize,0,gl.DEPTH_COMPONENT,gl.FLOAT,null);              // data
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  depthFramebuffer2 = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer2);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,depthTexture2,0);

  // setup shadow texture for spotlight
  depthTexture3 = gl.createTexture();
  depthTextureSize = 2048;
  gl.activeTexture(gl.TEXTURE0 + depthTextureIndex3);
  gl.bindTexture(gl.TEXTURE_2D, depthTexture3);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT32F,depthTextureSize,depthTextureSize,0,gl.DEPTH_COMPONENT,gl.FLOAT,null);              // data
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  depthFramebuffer3 = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer3);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,depthTexture3,0);

  // setup cube texture
  cubeTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + cubeTextureIndex);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
  const cubeFaces = [
    {
      face: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      // imagePath: 'assets/cube/posX.png',
      imagePath: 'assets/cube2/water.right.png',
    },
    {
      face: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      // imagePath: 'assets/cube/negX.png',
      imagePath: 'assets/cube2/water.left.png',
    },
    {
      face: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      // imagePath: 'assets/cube/posY.png',
      imagePath: 'assets/cube2/water.up.png',
    },
    {
      face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      // imagePath: 'assets/cube/negY.png',
      imagePath: 'assets/cube2/water.down.png',
    },
    {
      face: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      // imagePath: 'assets/cube/posZ.png',
      imagePath: 'assets/cube2/water.back.png',
    },
    {
      face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      // imagePath: 'assets/cube/negZ.png',
      imagePath: 'assets/cube2/water.front.png',
    }
  ];
  cubeFaces.forEach((cubeFace)=>{
    const {face, imagePath} = cubeFace;
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 512;
    const height = 512;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    // setup each face so it's immediately renderable and load image asynchronously
    gl.texImage2D(face, level, internalFormat, width, height, 0, format, type, null);
    const image = new Image();
    image.src = imagePath;
    image.addEventListener('load', function() {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
      gl.texImage2D(face, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  

  // setup axis vao
  lines = [
    0,0,0,
    10,0,0,
    0,0,0,
    0,10,0,
    0,0,0,
    0,0,10
  ]
  lineBuffer = gl.createBuffer()
  ext.tagObject(lineBuffer, 'axis line buffer')
  lineVao = gl.createVertexArray();
  gl.bindVertexArray(lineVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
  // gl.vertexAttribPointer(program.a_position, 3, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(program.a_cam_position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.a_cam_position);
  gl.bindVertexArray(null);



  // setup background
  let positionsBackground = 
    [
        -1, -1,
        1, -1,
        -1,  1,
        -1,  1,
        1, -1,
        1,  1,
    ];
  let backgroundPositionsBuffer = gl.createBuffer();
  let backgroundVao = gl.createVertexArray();
  gl.bindVertexArray(backgroundVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, backgroundPositionsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionsBackground), gl.STATIC_DRAW);
  // debug([skyboxProgram.a_backgroundPosition])
  gl.vertexAttribPointer(skyboxProgram.a_position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(skyboxProgram.a_position);
  gl.bindVertexArray(null);
  renderer.backgroundVao = backgroundVao;
  
  // TODO
  inputElementsManager.drawButton('save 1', function(){renderer.saveGame(1)});
  inputElementsManager.drawButton('save 2', function(){renderer.saveGame(2)});
  inputElementsManager.drawButton('save 3', function(){renderer.saveGame(3)});
  inputElementsManager.drawButton('load 1', function(){renderer.loadGame(1)});
  inputElementsManager.drawButton('load 2', function(){renderer.loadGame(2)});
  inputElementsManager.drawButton('load 3', function(){renderer.loadGame(3)});
  // start rendering
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
                        'shaders/simpleFragmentShader.glsl',
                        'shaders/skyboxVertexShader.glsl',
                        'shaders/skyboxFragmentShader.glsl'], function (shaderText) {
    axisVertexShaderSource = shaderText[0];
    uniformLightVertexShaderSource = shaderText[1];
    axisFragmentShaderSource = shaderText[2];
    uniformLightFragmentShaderSource = shaderText[3];
    pointLightVertexShaderSource = shaderText[4];
    pointLightFragmentShaderSource = shaderText[5];
    simpleVertexShaderSource = shaderText[6];
    simpleFragmentShaderSource = shaderText[7];
    skyboxVertexShaderSource = shaderText[8];
    skyboxFragmentShaderSource = shaderText[9];
  });
}


function getLocations(){
  // get uniform locations inside the programs 
  // program for drawing axis
  
  // local space calculations
  // program.u_worldViewProjectionMatrix = gl.getUniformLocation(program, "u_worldViewProjectionMatrix");
  // program.a_position = gl.getAttribLocation(program, "a_position");
  // gl.enableVertexAttribArray(program.a_position);
  // uniforms for camera space calculations
  program.u_projectionMatrix = gl.getUniformLocation(program, "u_projectionMatrix");
  program.u_inverseViewMatrix = gl.getUniformLocation(program, "u_inverseViewMatrix");
  program.a_cam_position = gl.getAttribLocation(program, "a_cam_position");
  gl.enableVertexAttribArray(program.a_cam_position);

  // program for drawing the scene
  // calculations in local space
  program2.u_worldViewProjectionMatrix = gl.getUniformLocation(program2, "u_worldViewProjectionMatrix");
  program2.u_inverseTransposeWorldMatrix = gl.getUniformLocation(program2, "u_inverseTransposeWorldMatrix");
  program2.u_reverseLightDirection = gl.getUniformLocation(program2, "u_reverseLightDirection")
  program2.u_color = gl.getUniformLocation(program2, "u_color");
  program2.u_worldMatrix = gl.getUniformLocation(program2, "u_worldMatrix");
  program2.u_cameraWorldPosition = gl.getUniformLocation(program2, "u_cameraWorldPosition");
  program2.u_texture = gl.getUniformLocation(program2, "u_texture");
  program2.u_lightViewProjectionTextureMatrix = gl.getUniformLocation(program2, "u_lightViewProjectionTextureMatrix");
  program2.u_lightViewProjectionTextureMatrix2 = gl.getUniformLocation(program2, "u_lightViewProjectionTextureMatrix2");
  program2.u_depthTexture = gl.getUniformLocation(program2, "u_depthTexture");
  program2.u_depthTexture2 = gl.getUniformLocation(program2, "u_depthTexture2");
  program2.u_bias = gl.getUniformLocation(program2, "u_bias");
  program2.u_textureAnimationMatrix = gl.getUniformLocation(program2, "u_textureAnimationMatrix");
  program2.u_cubeTexture = gl.getUniformLocation(program2, "u_cubeTexture");
  program2.u_colorOpacity = gl.getUniformLocation(program2, "u_colorOpacity");
  program2.u_textureOpacity = gl.getUniformLocation(program2, "u_textureOpacity");
  program2.u_secondaryLightDirection = gl.getUniformLocation(program2, "u_secondaryLightDirection");
  program2.u_toonSpecularThreshold = gl.getUniformLocation(program2, "u_toonSpecularThreshold");
  program2.u_toonDiffuseThreshold = gl.getUniformLocation(program2, "u_toonDiffuseThreshold");
  program2.u_roughness = gl.getUniformLocation(program2, "u_roughness");
  // program2.u_decay = gl.getUniformLocation(program2, "u_decay");
  // program2.u_spotlightPower = gl.getUniformLocation(program2, "u_spotlightPower");
  // program2.u_ambientOpacity = gl.getUniformLocation(program2, "u_ambientOpacity");
  // program2.u_depthTexture3 = gl.getUniformLocation(program2, "u_depthTexture3");
  // program2.u_lightViewProjectionTextureMatrix3 = gl.getUniformLocation(program2, "u_lightViewProjectionTextureMatrix3");
  // program2.u_pointLightColor = gl.getUniformLocation(program2, "u_pointLightColor");
  // program2.u_spotlightDirection = gl.getUniformLocation(program2, "u_spotlightDirection");
  // program2.u_spotlightInnerLimit = gl.getUniformLocation(program2, "u_spotlightInnerLimit");
  // program2.u_spotlightOuterLimit = gl.getUniformLocation(program2, "u_spotlightOuterLimit");
  // program2.u_spotlightPosition = gl.getUniformLocation(program2, "u_spotlightPosition");
  // program2.u_uniformLightColor = gl.getUniformLocation(program2, "u_uniformLightColor");
  // program2.u_lightWorldPosition = gl.getUniformLocation(program2, "u_lightWorldPosition");
  program2.a_position = gl.getAttribLocation(program2, "a_position");
  program2.a_normal = gl.getAttribLocation(program2, "a_normal");
  program2.a_textureCoordinates = gl.getAttribLocation(program2, "a_textureCoordinates");
  program2.a_backgroundPosition = gl.getAttribLocation(program2, "a_backgroundPosition");
  // // calculations in camera space
  // // program2.u_worldViewProjectionMatrix = gl.getUniformLocation(program2, "u_worldViewProjectionMatrix");
  // program2.u_projectionMatrix = gl.getUniformLocation(program2, "u_projectionMatrix");
  // // program2.u_inverseTransposeWorldMatrix = gl.getUniformLocation(program2, "u_inverseTransposeWorldMatrix");
  // program2.u_reverseLightDirection = gl.getUniformLocation(program2, "u_reverseLightDirection")
  // program2.u_color = gl.getUniformLocation(program2, "u_color");
  // // program2.u_worldMatrix = gl.getUniformLocation(program2, "u_worldMatrix");
  // // program2.u_cameraWorldPosition = gl.getUniformLocation(program2, "u_cameraWorldPosition");
  // program2.u_texture = gl.getUniformLocation(program2, "u_texture");
  // // program2.u_lightViewProjectionTextureMatrix = gl.getUniformLocation(program2, "u_lightViewProjectionTextureMatrix");
  // // program2.u_lightViewProjectionTextureMatrix2 = gl.getUniformLocation(program2, "u_lightViewProjectionTextureMatrix2");
  // program2.u_textureMatrix = gl.getUniformLocation(program2, "u_textureMatrix");
  // program2.u_textureMatrix2 = gl.getUniformLocation(program2, "u_textureMatrix2");
  // program2.u_depthTexture = gl.getUniformLocation(program2, "u_depthTexture");
  // program2.u_depthTexture2 = gl.getUniformLocation(program2, "u_depthTexture2");
  // program2.u_bias = gl.getUniformLocation(program2, "u_bias");
  // program2.u_textureAnimationMatrix = gl.getUniformLocation(program2, "u_textureAnimationMatrix");
  // program2.u_cubeTexture = gl.getUniformLocation(program2, "u_cubeTexture");
  // program2.u_colorOpacity = gl.getUniformLocation(program2, "u_colorOpacity");
  // program2.u_textureOpacity = gl.getUniformLocation(program2, "u_textureOpacity");
  // program2.u_secondaryLightDirection = gl.getUniformLocation(program2, "u_secondaryLightDirection");
  // program2.u_toonSpecularThreshold = gl.getUniformLocation(program2, "u_toonSpecularThreshold");
  // program2.u_toonDiffuseThreshold = gl.getUniformLocation(program2, "u_toonDiffuseThreshold");
  // program2.u_roughness = gl.getUniformLocation(program2, "u_roughness");
  // program2.a_cam_position = gl.getAttribLocation(program2, "a_cam_position");
  // program2.a_cam_normal = gl.getAttribLocation(program2, "a_cam_normal");
  // program2.a_textureCoordinates = gl.getAttribLocation(program2, "a_textureCoordinates");
  // program2.a_backgroundPosition = gl.getAttribLocation(program2, "a_backgroundPosition");
  
  // program for drawing shadowmaps
  // local space
  simpleProgram.u_worldViewProjectionMatrix = gl.getUniformLocation(simpleProgram, "u_worldViewProjectionMatrix");
  simpleProgram.u_color = gl.getUniformLocation(simpleProgram, "u_color");
  simpleProgram.a_position = gl.getAttribLocation(simpleProgram, "a_position");
  // // camera space
  // simpleProgram.u_projectionMatrix = gl.getUniformLocation(simpleProgram, "u_projectionMatrix");
  // simpleProgram.u_color = gl.getUniformLocation(simpleProgram, "u_color");
  // simpleProgram.a_cam_position = gl.getAttribLocation(simpleProgram, "a_cam_position");

  // program for drawing skybox
  skyboxProgram.a_position= gl.getAttribLocation(skyboxProgram, "a_position");
  gl.enableVertexAttribArray(skyboxProgram.a_position);
  skyboxProgram.u_skybox= gl.getUniformLocation(skyboxProgram, "u_skybox");
  skyboxProgram.u_inverseViewProjectionMatrix= gl.getUniformLocation(skyboxProgram, "u_inverseViewProjectionMatrix");
}


async function loadTexture(pathToTextureImage){

  // Create a texture.
  let texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + objectTextureIndex);
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
}
