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
        this.textures = [];

    }


    addModel(name, model, program, textureIndex = 0){
        let vertexBuffer = gl.createBuffer();
        let indexBuffer = gl.createBuffer();
        let normalBuffer = gl.createBuffer();
        let textureBuffer = gl.createBuffer();
        if(useLinter){
            ext.tagObject(vertexBuffer, name+'vertexBuffer');
            ext.tagObject(indexBuffer, name+'indexBuffer');
            ext.tagObject(normalBuffer, name+'normalBuffer');
            ext.tagObject(textureBuffer, name+'textureBuffer');
        }
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.a_position, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertexNormals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.a_normal, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.textures), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.a_textureCoordinates, 2, gl.FLOAT, false, 0, 0);


        let newModel = {'name': name,
                        'model': model,
                        'program': program,
                        'vertexBuffer': vertexBuffer,
                        'indexBuffer': indexBuffer,
                        'normalBuffer': normalBuffer,
                        'textureBuffer': textureBuffer,
                        'textureIndex': textureIndex};
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


    newFrame(timeNow){
        let view, projection;
        // this commented code is for later
        // view = utils.MakeView(spotlightPosition[0], spotlightPosition[1], spotlightPosition[2], lightElevation, lightAngle);
        // view = utils.MakeLookAt(spotlightPosition, [0,0,0], [0,1,0])
        // projection = utils.MakePerspective(60, 2, 1, 100);
        // renderer.drawRegisteredObjects(view, projection, simpleProgram);





        view = renderer.camera.view();
        projection = renderer.camera.createProjection(projectionType);
        if(document.getElementById('draw_axis').checked){
            renderer.drawAxisLines(view, projection);
        }
        renderer.drawRegisteredObjects(view, projection, program2);
        window.requestAnimationFrame(renderer.newFrame);

    }
    drawRegisteredObjects(view, projection, program){
        // local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
        for(i=0; i<this.objects.length; i++){
            let rotation_matrix, translation_matrix, scale_matrix, worldMatrix;
            let viewProjectionMatrix, worldViewProjectionMatrix, inverseTransposeWorldMatrix;
            let model;

            rotation_matrix = this.objects[i].orientation.toMatrix4();
            translation_matrix = utils.MakeTranslateMatrix(this.objects[i].position[0],this.objects[i].position[1],this.objects[i].position[2])
            scale_matrix = utils.MakeScaleMatrix(this.objects[i].scale);
            worldMatrix = utils.multiplyMatrices(translation_matrix, utils.multiplyMatrices(rotation_matrix, scale_matrix));
            viewProjectionMatrix = utils.multiplyMatrices(projection, view);
            worldViewProjectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, worldMatrix);
            inverseTransposeWorldMatrix = utils.transposeMatrix(utils.invertMatrix(worldMatrix));

            model = this.models.filter(item => item.name == renderer.objects[i].type)[0];

            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
            gl.vertexAttribPointer(program.a_position, 3, gl.FLOAT, false, 0, 0);
            try{
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
                gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
                gl.vertexAttribPointer(program.a_normal, 3, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
                gl.vertexAttribPointer(program.a_textureCoordinates, 2, gl.FLOAT, false, 0, 0);
            }catch(error){
                console.log('could not set normal or texture buffers')
            }
            
            gl.uniformMatrix4fv(program.u_worldViewProjectionMatrix, true, worldViewProjectionMatrix);

            try{
                gl.uniform4f(program.u_color, color[0], color[1], color[2], color[3]);
                gl.uniform3fv(program2.u_reverseLightDirection, utils.normalizeVector3(light));
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
            }catch(error){
                console.log('something bad happened when setting uniforms and attributes')
            }
            

            gl.bindTexture(gl.TEXTURE_2D, renderer.textures[model.textureIndex]);
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = model.model.indices.length;
            gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
        }
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
    
    
    drawAxisLines(view, projection){
        
        gl.useProgram(program);
        var wvpMatrix_1 = utils.multiplyMatrices(projection, view); // for program 1, used by plane and axis
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
}
