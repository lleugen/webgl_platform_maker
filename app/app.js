"use strict";
function main() {
  loadShaders();
  loadModels();
  loadDir();
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

  textureTerrain = gl.createTexture();
  // use texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // bind to the TEXTURE_2D bind point of texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, textureTerrain);
  // Asynchronously load an image
  var image = new Image();
  image.src = baseDir + "Terrain-Texture_2.png";
  image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, textureTerrain);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      gl.generateMipmap(gl.TEXTURE_2D);
    };


  // create shaders from sources loaded above
  fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  vertexShader_2 = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource_2);
  vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  fancyFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fancyFragmentShaderSource);
  vertexShader_tex = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource_tex);
  fragmentShader_tex = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource_tex);

  // create programs with a vertex shader and a fragment shader
  // tag the programs with a name so the linter can tell us where errors come from
  // todo make program for every model
  program2 = createProgram(gl, vertexShader_2, fancyFragmentShader);
  ext.tagObject(program2, "program2");
  program = createProgram(gl, vertexShader, fragmentShader);
  ext.tagObject(program, "program");
  programTex = createProgram(gl, vertexShader_tex, fragmentShader_tex);
  ext.tagObject(programTex, "programTex");


  // get uniform locations inside the programs
  program.projection_uniform_location = gl.getUniformLocation(program, "projection");
  program2.projection_uniform_location = gl.getUniformLocation(program2, "projection");
  programTex.projection_uniform_location = gl.getUniformLocation(programTex, "matrix");

  program.vertexPositionAttribute = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);
  program2.vertexPositionAttribute = gl.getAttribLocation(program2, "a_position");
  gl.enableVertexAttribArray(program2.vertexPositionAttribute);
  programTex.vertexPositionAttribute = gl.getAttribLocation(programTex, "a_position")
  gl.enableVertexAttribArray(programTex.vertexPositionAttribute);

  program2.light = gl.getUniformLocation(program2, "light");
  program2.matcol = gl.getUniformLocation(program2, "matcol");

  programTex.uvAttributeLocation = gl.getAttribLocation(programTex, "a_uv");
  programTex.textLocation = gl.getUniformLocation(programTex, "u_texture");

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
  renderer = new staticObjectRenderer();

  renderer.addModel('tree', tree, programTex, textureTerrain);
  renderer.addModel('hedge', hedge, programTex, textureTerrain);
  renderer.addModel('rock', rock, program2,null);
  renderer.addModel('brick', brick,programTex,textureTerrain);
  renderer.addModel('cloud', cloud,programTex,textureTerrain);
  renderer.addModel('cylinder', cylinder,programTex,textureTerrain);
  renderer.addModel('mountain', mountain,programTex,textureTerrain);
  renderer.addModel('square', square, program2,null);
  renderer.addModel('sphere', createSphere(), program2,null);
  renderer.addModel('triangle', createTriangle(), program2,null);
  renderer.addModel('ghost', ghost, program2,null);
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
                        'shaders/fancyFragmentShader.glsl',
                        'shaders/vertex-shader-tex.glsl',
                        'shaders/texFragmentShader.glsl'], function (shaderText) {
    vertexShaderSource = shaderText[0];
    vertexShaderSource_2 = shaderText[1];
    fragmentShaderSource = shaderText[2];
    fancyFragmentShaderSource = shaderText[3];
    vertexShaderSource_tex = shaderText[4];
    fragmentShaderSource_tex = shaderText[5];
  });
}
async function loadDir(){
  // Asynchronously load an image
  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');

}
