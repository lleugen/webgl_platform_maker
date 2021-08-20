class Renderer{
    constructor(){
        this.sprite;
        this.objects = [];
        this.models = [];
        this.camera = new Camera();
        inputElementsManager.drawSelectButton('world');
        inputElementsManager.drawCreateButton('delete');
        inputElementsManager.drawCreateButton('none');
        console.log('renderer created');
        // this.addObject('triangle_0', 'triangle', [0,0,0], [0,0,0], [0,0,0], 1);
    }


    addModel(name, model, program){
        let vertexBuffer = gl.createBuffer();
        let indexBuffer = gl.createBuffer();
        let normalBuffer = gl.createBuffer();
        if(useLinter){
            ext.tagObject(vertexBuffer, name+'vertexBuffer');
            ext.tagObject(indexBuffer, name+'indexBuffer');
            ext.tagObject(normalBuffer, name+'normalBuffer');
        }
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.a_position, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertexNormals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.a_normal, 3, gl.FLOAT, false, 0, 0);

        let newModel = {'name': name,
                        'model': model,
                        'program': program,
                        'vertexBuffer': vertexBuffer,
                        'indexBuffer': indexBuffer,
                        'normalBuffer': normalBuffer};
        this.models.push(newModel);
        inputElementsManager.drawCreateButton(name)   
    }


    addObject(name, type, position=[0,0,0], orientation=new Quaternion(), orientationDeg=[0,0,0], scale=1){
        if(type == "ghost"){
            let ghosts = renderer.objects.filter(item => item.name.includes("ghost"));
            if(ghosts.length > 0){
                this.updateObjectPosition(ghosts[0].name, position[0], position[2]);
            }
            else{
                let newObject = {
                    'name': name,
                    'type': type, // model name
                    'position': position,
                    'orientation': orientation,
                    'orientationDeg': orientationDeg,
                    'scale': scale
                }
                this.objects.push(newObject);
                inputElementsManager.drawSelectButton(newObject.name);
                inputElementsManager.drawDeleteButton(newObject.name);
                focusedObjectName = name;
                console.log('created new object', name)
                renderer.sprite = new Sprite(position);
            }
        }
        else{
            let newObject = {
                'name': name,
                'type': type, // model name
                'position': position,
                'orientation': orientation,
                'orientationDeg': orientationDeg,
                'scale': scale
            }
            this.objects.push(newObject);
            inputElementsManager.drawSelectButton(newObject.name);
            inputElementsManager.drawDeleteButton(newObject.name);
            focusedObjectName = name;
            console.log('created new object', name)
        }
    }


    deleteObject(name){
        this.objects = this.objects.filter(function(object){return object.name != name});
        inputElementsManager.deleteButton(name);
        inputElementsManager.deleteButton('delete '+name);
        console.log('deleted', name, this.objects);
    }


    draw(){ // maybe a better name is updateFrame
        viewMatrix = renderer.camera.view();
        projectionMatrix = renderer.camera.createProjection(projectionType);
      
        if(document.getElementById('xz_plane').checked){
            renderer.drawYplane();
        }
        if(document.getElementById('draw_axis').checked){
            renderer.drawAxisLines();
        }
        if(play_state){
            renderer.sprite.triggerMove();
        }
        renderer.drawObjects();
        
        window.requestAnimationFrame(renderer.draw);
      }


    drawObjects(){
        let i;
        let worldMatrix;

        for(i=0; i<this.objects.length; i++){
            let q = this.objects[i].orientation
            let rotation_matrix;
            if(document.getElementById("quaternionRotation").checked){
                rotation_matrix = q.toMatrix4();
            }
            else{
                let rx = utils.MakeRotateXMatrix(this.objects[i].orientationDeg[0]);
                let ry = utils.MakeRotateYMatrix(this.objects[i].orientationDeg[1]);
                let rz = utils.MakeRotateZMatrix(this.objects[i].orientationDeg[2]);
                rotation_matrix = utils.multiplyMatrices(rx, ry);
                rotation_matrix = utils.multiplyMatrices(rotation_matrix, rz);
            }
            
            // rotation_matrix = utils.transposeMatrix(rotation_matrix)
            let translation_matrix = utils.MakeTranslateMatrix(this.objects[i].position[0],this.objects[i].position[1],this.objects[i].position[2])
            let scale_matrix = utils.MakeScaleMatrix(this.objects[i].scale);
            worldMatrix = utils.multiplyMatrices(rotation_matrix, scale_matrix);
            worldMatrix = utils.multiplyMatrices(translation_matrix, worldMatrix);
            let model = this.models.filter(item => item.name == renderer.objects[i].type)[0];
            this.drawModel(model, worldMatrix, model.program);
        }
    }


    drawModel(model, worldMatrix, program){
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
        gl.vertexAttribPointer(program.a_position, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
        gl.vertexAttribPointer(program.a_normal, 3, gl.FLOAT, false, 0, 0);

        gl.uniform4f(program.u_color, color[0], color[1], color[2], color[3]);
        let reverseLight = light;

        gl.uniform3fv(program2.u_reverseLightDirection, utils.normalizeVector3(reverseLight));
        //here we need to put the transforms: local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
        let viewProjectionMatrix = utils.multiplyMatrices(projectionMatrix, viewMatrix);
        let worldViewProjectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, worldMatrix);
        let inverseTransposeWorldMatrix = utils.transposeMatrix(utils.invertMatrix(worldMatrix));
    
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = model.model.indices.length;
        
        gl.uniformMatrix4fv(program.u_worldViewProjectionMatrix, true, worldViewProjectionMatrix);
        gl.uniformMatrix4fv(program.u_inverseTransposeWorldMatrix, true, inverseTransposeWorldMatrix);

        gl.uniform3fv(program.u_lightWorldPosition, pointLightPosition);
        gl.uniform3fv(program.u_cameraWorldPosition, [renderer.camera.x, renderer.camera.y, renderer.camera.z])
        gl.uniformMatrix4fv(program.u_worldMatrix, true, worldMatrix);
        gl.uniform3fv(program.u_uniformLightColor, uniformLightColor);
        gl.uniform3fv(program.u_pointLightColor, pointLightColor);
        gl.uniform3fv(program.u_spotlightPosition, spotlightPosition);
        
        gl.uniform3fv(program.u_spotlightDirection, spotlightDirection);
        gl.uniform1f(program.u_spotlightInnerLimit, spotlightInnerLimit);
        gl.uniform1f(program.u_spotlightOuterLimit, spotlightOuterLimit);


        gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
    }


    


    updateObjectPosition(name, x, z){
        let object;
        object = this.objects.filter(item=>item.name==name)[0]
        object.position[0] = x;
        object.position[2] = z;
    }


    updateObjectHeight(name, h){
        let object;
        object = this.objects.filter(item=>item.name==name)[0]
        object.position[1] += h;
    }


    updateObjectScale(name, s){
        let object;
        object = this.objects.filter(item=>item.name==name)[0]
        object.scale = s;
        if(object.scale <= 0){
            object.scale = 0.05;
            console.log('object scale is lower bounded at 0.05')
        }
    }


    updateOrientation(o, rvx, rvy, rvz){

        let object = renderer.objects.filter(i=>i.name==o)[0];
        if(document.getElementById("quaternionRotation").checked){
            let dq1 = new Quaternion(Math.cos(rvx/2/180*Math.PI),
                                    Math.sin(rvx/2/180*Math.PI)*1,
                                    Math.sin(rvx/2/180*Math.PI)*0,
                                    Math.sin(rvx/2/180*Math.PI)*0);
            dq1.normalize();
            let dq2 = new Quaternion(Math.cos(rvy/2/180*Math.PI),
                                    Math.sin(rvy/2/180*Math.PI)*0,
                                    Math.sin(rvy/2/180*Math.PI)*1,
                                    Math.sin(rvy/2/180*Math.PI)*0);
            dq2.normalize();
            let dq3 = new Quaternion(Math.cos(rvz/2/180*Math.PI),
                                    Math.sin(rvz/2/180*Math.PI)*0,
                                    Math.sin(rvz/2/180*Math.PI)*0,
                                    Math.sin(rvz/2/180*Math.PI)*1);
            dq3.normalize();
            let dq = dq1.mul(dq2).mul(dq3);
            object.orientation = (dq.mul(object.orientation)).normalize()
            console.log(object.position, object.orientation, object.scale)
        }
        else{
            object.orientationDeg[0] += rvx;
            object.orientationDeg[1] += rvy;
            object.orientationDeg[2] += rvz;
        }
    }
    
    
    drawAxisLines(){
        
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
        gl.vertexAttribPointer(program2.a_position, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, lines.length/3);
    }
    
    
    
    drawYplane(){
        // var wvpMatrix_1 = utils.multiplyMatrices(projectionMatrix, viewMatrix); // for program 1, used by plane and axis
        // gl.useProgram(program);
        // gl.uniformMatrix4fv(program.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix_1));
        // var plane = [
        //     -10,0,-10,
        //     -10,0,10,
        //     10,0,-10,
        //     10,0,-10,
        //     -10,0,10,
        //     10,0,10,
        // ]
        // var planeBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane), gl.STATIC_DRAW);
        // gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        // gl.drawArrays(gl.TRIANGLES, 0, plane.length/3);




        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program2, "a_position");
        var normalLocation = gl.getAttribLocation(program2, "a_normal");

        // lookup uniforms
        var worldViewProjectionLocation = gl.getUniformLocation(program2, "u_worldViewProjectionMatrix");
        var worldInverseTransposeLocation = gl.getUniformLocation(program2, "u_inverseTransposeWorldMatrix");
        var colorLocation = gl.getUniformLocation(program2, "u_color");
        var reverseLightDirectionLocation =
            gl.getUniformLocation(program2, "u_reverseLightDirection");

        // Create a buffer to put positions in
        var positionBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Put geometry data into buffer
        setGeometry(gl);

        // Create a buffer to put normals in
        var normalBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        // Put normals data into buffer
        setNormals(gl);

        function radToDeg(r) {
            return r * 180 / Math.PI;
        }

        function degToRad(d) {
            return d * Math.PI / 180;
        }

        var fieldOfViewRadians = degToRad(60);
        var fRotationRadians = 0;

        drawScene();

        // Setup a ui.
        webglLessonsUI.setupSlider("#fRotation", {value: radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360});

        function updateRotation(event, ui) {
            fRotationRadians = degToRad(ui.value);
            drawScene();
        }

        // Draw the scene.
        function drawScene() {
            // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

            // Tell WebGL how to convert from clip space to pixels
            // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // Clear the canvas AND the depth buffer.
            // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Turn on culling. By default backfacing triangles
            // will be culled.
            // gl.enable(gl.CULL_FACE);

            // Enable the depth buffer
            // gl.enable(gl.DEPTH_TEST);

            // Tell it to use our program (pair of shaders)
            gl.useProgram(program2);

            // Turn on the position attribute
            gl.enableVertexAttribArray(positionLocation);

            // Bind the position buffer.
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
            var size = 3;          // 3 components per iteration
            var type = gl.FLOAT;   // the data is 32bit floats
            var normalize = false; // don't normalize the data
            var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                positionLocation, size, type, normalize, stride, offset);

            // Turn on the normal attribute
            gl.enableVertexAttribArray(normalLocation);

            // Bind the normal buffer.
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

            // Tell the attribute how to get data out of normalBuffer (ARRAY_BUFFER)
            var size = 3;          // 3 components per iteration
            var type = gl.FLOAT;   // the data is 32bit floating point values
            var normalize = false; // normalize the data (convert from 0-255 to 0-1)
            var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                normalLocation, size, type, normalize, stride, offset);

            // Compute the projection matrix
            var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            var zNear = 1;
            var zFar = 2000;
            var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

            // Compute the camera's matrix
            var camera = [100, 150, 200];
            var target = [0, 35, 0];
            var up = [0, 1, 0];
            var cameraMatrix = m4.lookAt(camera, target, up);

            // Make a view matrix from the camera matrix.
            var viewMatrix = m4.inverse(cameraMatrix);

            // Compute a view projection matrix
            var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

            // Draw a F at the origin
            var worldMatrix = m4.yRotation(fRotationRadians);

            // Multiply the matrices.
            var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
            var worldInverseMatrix = m4.inverse(worldMatrix);
            var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

            // Set the matrices
            gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
            gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);

            // Set the color to use
            gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

            // set the light direction.
            gl.uniform3fv(reverseLightDirectionLocation, m4.normalize([0.5, 0.7, 1]));

            // Draw the geometry.
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 16 * 6;
            gl.drawArrays(primitiveType, offset, count);
        }
    }
}




function setGeometry(gl) {
    var positions = new Float32Array([
            // left column front
            0,   0,  0,
            0, 150,  0,
            30,   0,  0,
            0, 150,  0,
            30, 150,  0,
            30,   0,  0,
  
            // top rung front
            30,   0,  0,
            30,  30,  0,
            100,   0,  0,
            30,  30,  0,
            100,  30,  0,
            100,   0,  0,
  
            // middle rung front
            30,  60,  0,
            30,  90,  0,
            67,  60,  0,
            30,  90,  0,
            67,  90,  0,
            67,  60,  0,
  
            // left column back
              0,   0,  30,
             30,   0,  30,
              0, 150,  30,
              0, 150,  30,
             30,   0,  30,
             30, 150,  30,
  
            // top rung back
             30,   0,  30,
            100,   0,  30,
             30,  30,  30,
             30,  30,  30,
            100,   0,  30,
            100,  30,  30,
  
            // middle rung back
             30,  60,  30,
             67,  60,  30,
             30,  90,  30,
             30,  90,  30,
             67,  60,  30,
             67,  90,  30,
  
            // top
              0,   0,   0,
            100,   0,   0,
            100,   0,  30,
              0,   0,   0,
            100,   0,  30,
              0,   0,  30,
  
            // top rung right
            100,   0,   0,
            100,  30,   0,
            100,  30,  30,
            100,   0,   0,
            100,  30,  30,
            100,   0,  30,
  
            // under top rung
            30,   30,   0,
            30,   30,  30,
            100,  30,  30,
            30,   30,   0,
            100,  30,  30,
            100,  30,   0,
  
            // between top rung and middle
            30,   30,   0,
            30,   60,  30,
            30,   30,  30,
            30,   30,   0,
            30,   60,   0,
            30,   60,  30,
  
            // top of middle rung
            30,   60,   0,
            67,   60,  30,
            30,   60,  30,
            30,   60,   0,
            67,   60,   0,
            67,   60,  30,
  
            // right of middle rung
            67,   60,   0,
            67,   90,  30,
            67,   60,  30,
            67,   60,   0,
            67,   90,   0,
            67,   90,  30,
  
            // bottom of middle rung.
            30,   90,   0,
            30,   90,  30,
            67,   90,  30,
            30,   90,   0,
            67,   90,  30,
            67,   90,   0,
  
            // right of bottom
            30,   90,   0,
            30,  150,  30,
            30,   90,  30,
            30,   90,   0,
            30,  150,   0,
            30,  150,  30,
  
            // bottom
            0,   150,   0,
            0,   150,  30,
            30,  150,  30,
            0,   150,   0,
            30,  150,  30,
            30,  150,   0,
  
            // left side
            0,   0,   0,
            0,   0,  30,
            0, 150,  30,
            0,   0,   0,
            0, 150,  30,
            0, 150,   0]);
  
    // Center the F around the origin and Flip it around. We do this because
    // we're in 3D now with and +Y is up where as before when we started with 2D
    // we had +Y as down.
  
    // We could do by changing all the values above but I'm lazy.
    // We could also do it with a matrix at draw time but you should
    // never do stuff at draw time if you can do it at init time.
    var matrix = m4.xRotation(Math.PI);
    matrix = m4.translate(matrix, -50, -75, -15);
  
    for (var ii = 0; ii < positions.length; ii += 3) {
      var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
      positions[ii + 0] = vector[0];
      positions[ii + 1] = vector[1];
      positions[ii + 2] = vector[2];
    }
  
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }
  
  function setNormals(gl) {
    var normals = new Float32Array([
            // left column front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // top rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // middle rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // left column back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // top rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // middle rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
  
            // top rung right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
  
            // under top rung
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
  
            // between top rung and middle
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
  
            // top of middle rung
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
  
            // right of middle rung
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
  
            // bottom of middle rung.
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
  
            // right of bottom
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
  
            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
  
            // left side
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  }
