var canvas;

var context = null,
	program = null,
	mesh = null;
	
var projectionMatrix, 
	viewMatrix,
	worldMatrix;
//Parameters for Camera
var elevation = 0.0;
var angle = 0.0;

var tTransform;
var sTransform = [];
var sTransformText = [];

var curr_tTransform = 0;
var curr_sTransform = 0;
var changeT = true;

// Vertex shader
var vs = `#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define UV_LOCATION 2

layout(location = POSITION_LOCATION) in vec3 in_pos;
layout(location = NORMAL_LOCATION) in vec3 in_norm;
layout(location = UV_LOCATION) in vec2 in_uv;

uniform mat4 pMatrix;

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
	fs_pos = in_pos;
	fs_norm = in_norm;
	fs_uv = vec2(in_uv.x,1.0-in_uv.y);
	
	gl_Position = pMatrix * vec4(in_pos, 1);
}`;

// Fragment shader
var fs = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D u_texture;

out vec4 color;

void main() {
	color = texture(u_texture, fs_uv);
}`;

function InitTransforms() {
	vi = [utils.MakeScaleMatrix(0.1)];
	tTransform = vi.concat(perspective());

	sTransformText[0] = "Make perspective projection, FoV-y = 70 deg, a = 16/9, n = 1, f = 101";
	sTransform[0] = utils.MakePerspective(70,16/9,1,101);
		
	sTransformText[1] = "Make perspective projection, FoV-y = 105 deg, a = 16/9, n = 1, f = 101";
	sTransform[1] = utils.MakePerspective(105,16/9,1,101);


	
	sTransformText[2] = "Make perspective projection, FoV-y = 40 deg, a = 16/9, n = 1, f = 101";
	sTransform[2] = utils.MakePerspective(40,16/9,1,101);

	
	sTransformText[3] = "Make perspective projection, FoV-y = 90 deg, a = 4/3, n = 1, f = 101. Note: since the aspect ratio is not correct, the image should appear to be deformed";
	sTransform[3] = utils.MakePerspective(90,4/3,1,101);
	       	       
	sTransformText[4] = "Make perspective projection, l = -1.2, r = 0, t = 0.3375, b = -0.3375, n = 1, f = 101. Note: due to the asimmetry of this projection, only the left part of the scene should be visible";
	sTransform[4] = utils.MakeCompletePerspective(-1.2,0,-0.3375,0.3375,1,101);
	       	       
	document.getElementById("p1").innerHTML = sTransformText[0];
}

function main(){
    console.log('start')
    InitTransforms();
    canvas = document.getElementById("my-canvas");
    if(!canvas){
        console.log("could not get canvas")
        return
    }
    context = canvas.getContext("webgl2");
    if(!context){
        console.log("could not get context")
        return
    }
    if(context){
        console.log('canvas and context loaded in main')
    }
    
    program = context.createProgram();
    var v1 = context.createShader(context.VERTEX_SHADER);
    context.shaderSource(v1, vs);
    context.compileShader(v1);
    if (!context.getShaderParameter(v1, context.COMPILE_STATUS)) {
        alert("ERROR IN VS SHADER : " + context.getShaderInfoLog(v1));
    }
    var v2 = context.createShader(context.FRAGMENT_SHADER);
    context.shaderSource(v2, fs)
    context.compileShader(v2);		
    if (!context.getShaderParameter(v2, context.COMPILE_STATUS)) {
        alert("ERROR IN FS SHADER : " + context.getShaderInfoLog(v2));
    }			
    context.attachShader(program, v1);
    context.attachShader(program, v2);
    context.linkProgram(program);				
    
    context.useProgram(program);

    // objStr = document.getElementById('ghost').innerHTML

    mesh = new OBJ.Mesh(objStr);

    // Create a texture
    // imgtx = new Image();
    // imgtx.onload = function() {
    //     var textureId = context.createTexture();
    //     context.activeTexture(context.TEXTURE0 + 0);
    //     context.bindTexture(context.TEXTURE_2D, textureId);		
    //     context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, imgtx);		
    // // set the filtering so we don't need mips
    //     context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST);
    //     context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST);
    //     context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    //     context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    // }
    // imgtx.src = TextureData;
    
    // links mesh attributes to shader attributes
    program.vertexPositionAttribute = context.getAttribLocation(program, "in_pos");
    context.enableVertexAttribArray(program.vertexPositionAttribute);
        
    program.vertexNormalAttribute = context.getAttribLocation(program, "in_norm");
    context.enableVertexAttribArray(program.vertexNormalAttribute);
        
    program.textureCoordAttribute = context.getAttribLocation(program, "in_uv");
    context.enableVertexAttribArray(program.textureCoordAttribute);

    program.WVPmatrixUniform = context.getUniformLocation(program, "pMatrix");
    program.textureUniform = context.getUniformLocation(program, "u_texture");
    
    OBJ.initMeshBuffers(context, mesh);
    
    // prepares the world, view and projection matrices.
    var w=canvas.clientWidth;
    var h=canvas.clientHeight;
    
    context.clearColor(0.0, 0.0, 0.0, 1.0);
    context.viewport(0.0, 0.0, w, h);
    
    // selects the mesh
    context.bindBuffer(context.ARRAY_BUFFER, mesh.vertexBuffer);
    context.vertexAttribPointer(program.vertexPositionAttribute, mesh.vertexBuffer.itemSize, context.FLOAT, false, 0, 0);
    context.bindBuffer(context.ARRAY_BUFFER, mesh.textureBuffer);
    context.vertexAttribPointer(program.textureCoordAttribute, mesh.textureBuffer.itemSize, context.FLOAT, false, 0, 0);
    
    context.bindBuffer(context.ARRAY_BUFFER, mesh.normalBuffer);
    context.vertexAttribPointer(program.vertexNormalAttribute, mesh.normalBuffer.itemSize, context.FLOAT, false, 0, 0);
        
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);		
    
//     var textureId = context.createTexture();
//     context.activeTexture(context.TEXTURE0 + 0);
//     context.bindTexture(context.TEXTURE_2D, textureId);		
//     context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, imgtx);		
// // set the filtering so we don't need mips
//     context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST);
//     context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST);
//     context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
//     context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);

    // turn on depth testing
    context.enable(context.DEPTH_TEST);
    drawScene();
}

function drawScene() {
    // update WV matrix
    cx = utils.degToRad(angle*30);
    cy = -utils.degToRad(elevation*30);
    viewMatrix = utils.MakeWorld(0,0,-5, cx, cy, 0, 1);

    // sets the uniforms
    context.uniform1i(program.textureUniform, 0);

    // draws the request
    var preScale = 0.8;
    WVPmatrix = utils.multiplyMatrices(utils.multiplyMatrices(sTransform[curr_sTransform], viewMatrix), utils.MakeScaleMatrix(preScale));
    context.uniformMatrix4fv(program.WVPmatrixUniform, context.FALSE, utils.transposeMatrix(WVPmatrix));		
    context.drawElements(context.LINE_STRIP, mesh.indexBuffer.numItems, context.UNSIGNED_SHORT, 0);		
    
    // draws the answer
    if(!changeT) {
        WVPmatrix = utils.multiplyMatrices(utils.multiplyMatrices(tTransform[curr_tTransform], viewMatrix), utils.MakeScaleMatrix(preScale));;
        context.uniformMatrix4fv(program.WVPmatrixUniform, context.FALSE, utils.transposeMatrix(WVPmatrix));		
        context.drawElements(context.TRIANGLES, mesh.indexBuffer.numItems, context.UNSIGNED_SHORT, 0);
    }

    
    window.requestAnimationFrame(drawScene);		
}


// var canvas = document.getElementById("canvas");
// var context = canvas.getContext("2d");
// context.fillStyle = "#FF0000";
// context.fillRect(0,0,150,75);

// async function load_object(){
//     const response = await fetch("./assets/ghost.obj");
// }