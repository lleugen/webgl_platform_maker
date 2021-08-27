class Renderer{
    constructor(){
        this.sprite;
        this.objects = [];
        this.models = [];
        this.camera = new Camera();
        inputElementsManager.drawSelectButton('world');
        inputElementsManager.drawCreateButton('delete');
        inputElementsManager.drawCreateButton('none');
        inputElementsManager.drawButton('delete everything', this.deleteEverything);
        inputElementsManager.drawButton('create things', function(){renderer.makeRandom(modelNames[Math.floor(Math.random() * modelNames.length)], Math.ceil(Math.random() * 4))})
        console.log('renderer created');
        // this.addObject('triangle_0', 'triangle', [0,0,0], [0,0,0], [0,0,0], 1);
        this.textures = [];  

        this.lastUpdateTime;
        this.g_time = 0;

        this.backgroundVao = null;
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

        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.a_position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertexNormals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.a_normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_normal);
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.textures), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.a_textureCoordinates, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_textureCoordinates);
        gl.bindVertexArray(null);

        // read vertices to build the appropriate collision box
        let minx = 100
        let miny= 100
        let minz= 100
        let maxx= -100
        let maxy= -100
        let maxz= -100
        for(let i=0; i<model.vertices.length; i+=3){
            // console.log(rock.vertices[i], rock.vertices[i+1], rock.vertices[i+2]);
            minx = model.vertices[i] < minx ?  model.vertices[i] : minx
            miny = model.vertices[i+1] < miny ?  model.vertices[i+1] : miny
            minz = model.vertices[i+2] < minz ?  model.vertices[i+2] : minz
            maxx = model.vertices[i] > maxx ?  model.vertices[i] : maxx
            maxy = model.vertices[i+1] > maxy ?  model.vertices[i+1] : maxy
            maxz = model.vertices[i+2] > maxz ?  model.vertices[i+2] : maxz
        }
        let centre = [(maxx + minx)/2, (maxy + miny)/2, (maxz + minz)/2];
        let sizex = maxx - minx;
        let sizey = maxy - miny;
        let sizez = maxz - minz;
        let collisionData = [sizex, sizey, sizez, centre];

        let newModel = {'name': name,
                        'model': model,
                        'program': program,
                        'vertexBuffer': vertexBuffer,
                        'indexBuffer': indexBuffer,
                        'normalBuffer': normalBuffer,
                        'textureBuffer': textureBuffer,
                        'textureIndex': textureIndex,
                        'vao' : vao,
                        'collisionData': collisionData};
        this.models.push(newModel);
        inputElementsManager.drawCreateButton(name)   
    }


    addObject(name, type, position=[0,0,0], orientation=new Quaternion(), orientationDeg=[0,0,0], scale=1){
        if(type == "ghost"){
            // special condition because we want only 1 ghost, on an attempt to draw a second one we just update the position
            let ghosts = renderer.objects.filter(item => item.name.includes("ghost"));
            if(ghosts.length > 0){
                this.updateObjectPosition(ghosts[0].name, position[0], position[2]);
            }
            else{
                // adjust object size
                let model = renderer.models.filter(item=>item.name==type);
                if(model.length != 0){
                    model = model[0];
                    let bigSide = Math.max(model.collisionData[0], model.collisionData[1], model.collisionData[2]);
                    scale = defaultSizes[model.name] / bigSide;
                }
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
                debug([renderer.sprite])
            }
        }
        else{
            // adjust object size
            let model = renderer.models.filter(item=>item.name==type);
            if(model.length != 0){
                model = model[0];
                let bigSide = Math.max(model.collisionData[0], model.collisionData[1], model.collisionData[2]);
                scale = defaultSizes[model.name] / bigSide;
            }
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
        if(play_state){
            renderer.sprite.triggerMove();
        }
        //first render everything with a simple shader to create the shadowmap
        let view, projection, lightViewProjection, lightViewProjectionTextureMatrix;
        // view = utils.MakeView(spotlightPosition[0], spotlightPosition[1], spotlightPosition[2], lightElevation, lightAngle);
        view = utils.MakeLookAt(uniformLightPosition, [0,0,0], [0,1,0])
        // projection = utils.MakePerspective(lightFov, 1, 1, 1000);
        projection = utils.MakeParallel(50, 1, 1, 100);
        lightViewProjection = utils.multiplyMatrices(projection, view);
        lightViewProjectionTextureMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(0.5,0.5,0.5), utils.multiplyMatrices(utils.MakeScaleMatrix(0.5), lightViewProjection))
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.viewport(0, 0, depthTextureSize, depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        renderer.drawRegisteredObjects(view, projection, simpleProgram, utils.identityMatrix());

        // then render the scene with shadows
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0.1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        view = renderer.camera.view();
        projection = renderer.camera.createProjection(projectionType);
        if(document.getElementById('draw_axis').checked){
            renderer.drawAxisLines(view, projection);
        }

        renderer.drawRegisteredObjects(view, projection, program2, lightViewProjectionTextureMatrix);
        // loop
        window.requestAnimationFrame(renderer.newFrame);
    }


    drawRegisteredObjects(view, projection, program, lightViewProjectionTextureMatrix){
        gl.depthFunc(gl.LESS);
        // local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
        gl.useProgram(program);

        // set uniforms common to all objects
        gl.uniform4f(program.u_color, color[0], color[1], color[2], color[3]);
        gl.uniform1f(program.u_bias, u_bias);
        gl.uniform3fv(program.u_reverseLightDirection, utils.normalizeVector3(light));
        gl.uniform3fv(program.u_lightWorldPosition, pointLightPosition);
        gl.uniform3fv(program.u_cameraWorldPosition, [renderer.camera.x, renderer.camera.y, renderer.camera.z])
        gl.uniform3fv(program.u_uniformLightColor, uniformLightColor);
        gl.uniform3fv(program.u_pointLightColor, pointLightColor);
        gl.uniform3fv(program.u_spotlightPosition, spotlightPosition);
        gl.uniform3fv(program.u_spotlightDirection, spotlightDirection);
        gl.uniform1f(program.u_spotlightInnerLimit, spotlightInnerLimit);
        gl.uniform1f(program.u_spotlightOuterLimit, spotlightOuterLimit);
        gl.uniformMatrix4fv(program.u_lightViewProjectionTextureMatrix, true, lightViewProjectionTextureMatrix);

        // calculate matrices common to all objects in the scene
        let viewProjectionMatrix = utils.multiplyMatrices(projection, view);

        // calculate time for animations
        var currentTime = (new Date).getTime();
        var deltaT;
        if(renderer.lastUpdateTime){
            deltaT = (currentTime - renderer.lastUpdateTime) / 1000.0;
        } else {
            deltaT = 1/50;
        }
        renderer.lastUpdateTime = currentTime;
        renderer.g_time += deltaT;
        let time = (renderer.g_time - 5 * Math.floor(renderer.g_time/5)) / 5;

        if(renderer.sprite){
            renderer.sprite.gravity(renderer.g_time);
        }
        // draw every registered object
        for(i=0; i<this.objects.length; i++){
            let rotation_matrix, translation_matrix, scale_matrix, worldMatrix;
            let worldViewProjectionMatrix, inverseTransposeWorldMatrix;
            let model = this.models.filter(item => item.name == renderer.objects[i].type)[0];

            // calculate object specific matrices
            rotation_matrix = this.objects[i].orientation.toMatrix4();
            translation_matrix = utils.MakeTranslateMatrix(this.objects[i].position[0],this.objects[i].position[1],this.objects[i].position[2])
            scale_matrix = utils.MakeScaleMatrix(this.objects[i].scale);
            worldMatrix = utils.multiplyMatrices(translation_matrix, utils.multiplyMatrices(rotation_matrix, scale_matrix));
            worldViewProjectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, worldMatrix);
            inverseTransposeWorldMatrix = utils.transposeMatrix(utils.invertMatrix(worldMatrix));

            // set object specific uniforms
            gl.uniformMatrix4fv(program.u_worldViewProjectionMatrix, true, worldViewProjectionMatrix);
            gl.uniformMatrix4fv(program.u_inverseTransposeWorldMatrix, true, inverseTransposeWorldMatrix);
            gl.uniformMatrix4fv(program.u_worldMatrix, true, worldMatrix);
            try{
                gl.uniform1i(program.u_depthTexture, depthTextureIndex);
                gl.uniform1i(program.u_texture, objectTextureIndex);
                gl.uniform1i(program.u_cubeTexture, cubeTextureIndex);
            }catch(error){
                console.log('this is fine'); // simpleProgram doesn't have textures, but it doesn't need them
            }

            // animate cloud texture
            if(this.objects[i].type == 'cloud'){
                let textureAnimationMatrix = this.animateCloud(time);
                gl.uniformMatrix4fv(program.u_textureAnimationMatrix, true, textureAnimationMatrix);
            }
            // don't animate everything else
            else{
                gl.uniformMatrix4fv(program.u_textureAnimationMatrix, true, utils.identityMatrix());
            }
            // animate rock rotation
            if(this.objects[i].type == 'rock'){
                this.objects[i].orientation = this.objects[i].orientation.mul(Quaternion.fromEuler(0,0,1/180*Math.PI))
            }

            // set textures
            gl.activeTexture(gl.TEXTURE0 + depthTextureIndex);
            gl.bindTexture(gl.TEXTURE_2D, depthTexture);
            gl.activeTexture(gl.TEXTURE0 + objectTextureIndex);
            gl.bindTexture(gl.TEXTURE_2D, renderer.textures[model.textureIndex]);
            // gl.activeTexture(gl.TEXTURE0 + cubeTextureIndex);
            // gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);

            // draw
            gl.bindVertexArray(model.vao);
            gl.drawElements(gl.TRIANGLES, model.model.indices.length, gl.UNSIGNED_SHORT, 0);
            gl.bindVertexArray(null);
        }
        this.drawBackground(viewProjectionMatrix);

    }  


    drawBackground(viewProjectionMatrix){
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(skyboxProgram);
        // set uniforms
        gl.uniformMatrix4fv(skyboxProgram.u_inverseViewProjectionMatrix, true, utils.invertMatrix(viewProjectionMatrix));
        gl.uniform1i(skyboxProgram.u_skybox, cubeTextureIndex);
        gl.activeTexture(gl.TEXTURE0 + cubeTextureIndex);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        // draw
        gl.bindVertexArray(renderer.backgroundVao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindVertexArray(null);
    }


    drawAxisLines(view, projection){
        gl.useProgram(program);
        var wvpMatrix_1 = utils.multiplyMatrices(projection, view); // for program 1, used by plane and axis
        gl.uniformMatrix4fv(program.u_worldViewProjectionMatrix, false, utils.transposeMatrix(wvpMatrix_1));
        gl.bindVertexArray(lineVao);
        gl.drawArrays(gl.LINES, 0, 6);
        gl.bindVertexArray(null);
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


    makeRandom(type, number, randomHeight=false){
        for(let i=0; i<number; i++){
            renderer.addObject(type+'_'+renderer.objects.length,
            type,
            [Math.random()*10, randomHeight ? Math.random()*10 : 0, Math.random()*10]);
        }
    }


    deleteEverything(){
        let names = [];
        for(let i=0; i<renderer.objects.length; i++){
            names.push(renderer.objects[i].name);
        }
        for(let i=0; i<names.length; i++){
            renderer.deleteObject(names[i]);
        } 
    }


    animateCloud(time){
	    var out = utils.identityMatrix();
	    let frameDuration = 2 / 98;
	    let currentFrame = Math.floor(time / frameDuration);
	    // console.log(currentFrame);
	    let yt = Math.floor(currentFrame / 14);
	    let xt = Math.floor(currentFrame % 14);
	    let scale = utils.MakeScaleMatrix(1/14);
	    let translate = utils.MakeTranslateMatrix(xt * 1/14, (1 - 1/7) - yt * 1/7, 0);
	    out = utils.multiplyMatrices(translate, scale)
	    // console.log(currentFrame, xt, yt)

	    return out;
    }


    animateRotation(time){
        return new Quaternion.fromEuler(0, 0, time);
    }


    
}
