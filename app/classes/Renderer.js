class Renderer{
    constructor(){
        this.sprite;
        this.objects = [];
        this.models = [];
        this.camera = new Camera();
        if(debugButtons){
            inputElementsManager.drawSelectButton('world');
        }
        inputElementsManager.drawCreateButton('delete');
        inputElementsManager.drawCreateButton('none');
        inputElementsManager.drawButton('delete everything', this.deleteEverything);
        inputElementsManager.drawButton('create things', function(){renderer.makeRandom(modelNames[Math.floor(Math.random() * modelNames.length)], Math.ceil(Math.random() * 4))})
        inputElementsManager.drawButton('create collectibles', this.addCollectibles);
        inputElementsManager.drawButton('create decorations', this.addDecorations);
        inputElementsManager.drawButton('create random level', this.createRandomLevel);

        console.log('renderer created');
        // this.addObject('triangle_0', 'triangle', [0,0,0], [0,0,0], [0,0,0], 1);
        this.textures = [];  

        this.lastUpdateTime;
        this.g_time = 0;

        this.backgroundVao = null;
    }


    addModel(name, model, program, textureIndex = -1){
        // local space
        let vertexBuffer = gl.createBuffer();
        let indexBuffer = gl.createBuffer();
        let normalBuffer = gl.createBuffer();
        let textureBuffer = gl.createBuffer();
        // // camera space
        // let indexBuffer = gl.createBuffer();
        // let textureBuffer = gl.createBuffer();

        if(useLinter){
            // local space
            ext.tagObject(vertexBuffer, name+'vertexBuffer');
            ext.tagObject(indexBuffer, name+'indexBuffer');
            ext.tagObject(normalBuffer, name+'normalBuffer');
            ext.tagObject(textureBuffer, name+'textureBuffer');
            // // camera space
            // ext.tagObject(indexBuffer, name+'indexBuffer');
            // ext.tagObject(textureBuffer, name+'textureBuffer');
        }

        // local space coordinates
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

        // // camera space coordinates
        // // let vao = gl.createVertexArray();
        // // gl.bindVertexArray(vao);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
        // // object coordinates depend on the current view so we cannot set buffer data because we don't know the coordinates of the object yet
        // // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        // // gl.vertexAttribPointer(program.a_position, 3, gl.FLOAT, false, 0, 0);
        // // gl.enableVertexAttribArray(program.a_position);
        // // gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        // // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertexNormals), gl.STATIC_DRAW);
        // // gl.vertexAttribPointer(program.a_normal, 3, gl.FLOAT, false, 0, 0);
        // // gl.enableVertexAttribArray(program.a_normal);
        // gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.textures), gl.STATIC_DRAW);
        // gl.vertexAttribPointer(program.a_textureCoordinates, 2, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(program.a_textureCoordinates);
        // // gl.bindVertexArray(null);

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

        // local space
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
        // // camera space
        // let newModel = {'name': name,
        //                 'model': model,
        //                 'program': program,
        //                 // 'vertexBuffer': vertexBuffer,
        //                 'indexBuffer': indexBuffer,
        //                 // 'normalBuffer': normalBuffer,
        //                 'textureBuffer': textureBuffer,
        //                 'textureIndex': textureIndex,
        //                 // 'vao' : vao,
        //                 'collisionData': collisionData};
        this.models.push(newModel);
        inputElementsManager.drawCreateButton(name)   
    }


    addObject(name, type, position=[0,0,0], orientation=new Quaternion(), orientationDeg=[0,0,0], scale=1){
        if(worldSettings['randomOrientation']){orientation = Quaternion.fromEuler(0,0,Math.random()*Math.PI)}
        
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
                if(debugButtons){
                    inputElementsManager.drawSelectButton(newObject.name);
                    inputElementsManager.drawDeleteButton(newObject.name);
                }
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
            if(worldSettings['randomScale']){
                scale *= Math.random()*2 + 0.5;
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
            if(debugButtons){
                inputElementsManager.drawSelectButton(newObject.name);
                inputElementsManager.drawDeleteButton(newObject.name);
            }
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
        // update sprite position every frame
        if(play_state){
            renderer.sprite.triggerMove();
        }

        // first render everything with a simple shader to create the shadowmaps
        // first the main uniform light
        let view, projection, lightViewProjection, lightViewProjectionTextureMatrix;
        // view = utils.MakeView(spotlightPosition[0], spotlightPosition[1], spotlightPosition[2], lightElevation, lightAngle);
        uniformLightPositionMoving = uniformLightPosition.slice();
        let lightFocus = [0,0,0]
        if(play_state){
            for(let i=0; i<3; i++){
                uniformLightPositionMoving[i] = uniformLightPosition[i]*2 + renderer.sprite.position[i];
                // uniformLightPositionMoving[i] *= 2;
            }
            lightFocus = renderer.sprite.position.slice();
        }
        view = utils.MakeLookAt(uniformLightPositionMoving, lightFocus, [0,1,0])
        // projection = utils.MakePerspective(lightFov, 1, 1, 1000);
        projection = utils.MakeParallel(100, 1, 1, 300);
        lightViewProjection = utils.multiplyMatrices(projection, view);
        // local space
        lightViewProjectionTextureMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(0.5,0.5,0.5), utils.multiplyMatrices(utils.MakeScaleMatrix(0.5), lightViewProjection))
        // // camera space
        // let lightViewProjectionCamSpace = utils.multiplyMatrices(renderer.camera.view(), lightViewProjection); // for camera space computations
        // lightViewProjectionTextureMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(0.5,0.5,0.5), utils.multiplyMatrices(utils.MakeScaleMatrix(0.5), lightViewProjectionCamSpace))

        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.viewport(0, 0, depthTextureSize, depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        renderer.drawRegisteredObjects(view, projection, simpleProgram, utils.identityMatrix(), true);
        //##
        // do the same again for the second light
        let view2, projection2, lightViewProjection2, lightViewProjectionTextureMatrix2;
        // view = utils.MakeView(spotlightPosition[0], spotlightPosition[1], spotlightPosition[2], lightElevation, lightAngle);
        secondaryUniformLightPositionMoving = secondaryUniformLightPosition.slice();
        let lightFocus2 = [0,0,0]
        if(play_state){
            for(let i=0; i<3; i++){
                secondaryUniformLightPositionMoving[i] = secondaryUniformLightPosition[i]*2 + renderer.sprite.position[i];
            }
            lightFocus2 = renderer.sprite.position.slice();
        }
        view2 = utils.MakeLookAt(secondaryUniformLightPositionMoving, lightFocus2, [0,1,0])
        // projection = utils.MakePerspective(lightFov, 1, 1, 1000);
        projection2 = utils.MakeParallel(100, 1, 1, 300);
        lightViewProjection2 = utils.multiplyMatrices(projection2, view2);
        lightViewProjectionTextureMatrix2 = utils.multiplyMatrices(utils.MakeTranslateMatrix(0.5,0.5,0.5), utils.multiplyMatrices(utils.MakeScaleMatrix(0.5), lightViewProjection2))
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer2);
        gl.viewport(0, 0, depthTextureSize, depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        renderer.drawRegisteredObjects(view2, projection2, simpleProgram, [utils.identityMatrix()], true);
        //##
        // // do the same again for the spotlight TODO make this into a loop
        // let view3, projection3, lightViewProjection3, lightViewProjectionTextureMatrix3;
        // let spotlightPositionMoving = spotlightPosition;
        // // let lightFocus3 = [0,0,0]
        // // if(play_state){
        // //     for(let i=0; i<3; i++){
        // //         spotlightPositionMoving[i] = spotlightPosition[i]*2 + renderer.sprite.position[i];
        // //     }
        // //     lightFocus2 = renderer.sprite.position.slice();
        // // }
        // // view3 = utils.MakeLookAt(secondaryUniformLightPositionMoving, lightFocus2, [0,1,0])
        // let dir = Math.asin((-spotlightDirection[0] / Math.sqrt(spotlightDirection[0]**2+spotlightDirection[1]**2+spotlightDirection[2]**2)))/Math.PI*180;
        // // console.log(dir, spotlightDirection)

        // view3 = utils.MakeView(spotlightPosition[0], spotlightPosition[1], spotlightPosition[2], 0, dir);
        // projection3 = utils.MakePerspective(lightFov, 1, 1, 500);
        // // projection2 = utils.MakeParallel(100, 1, 1, 300);
        // lightViewProjection3 = utils.multiplyMatrices(projection3, view3);
        // lightViewProjectionTextureMatrix3 = utils.multiplyMatrices(utils.MakeTranslateMatrix(0.5,0.5,0.5), utils.multiplyMatrices(utils.MakeScaleMatrix(0.5), lightViewProjection3))
        // gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer3);
        // gl.viewport(0, 0, depthTextureSize, depthTextureSize);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // renderer.drawRegisteredObjects(view3, projection3, simpleProgram, [utils.identityMatrix()], true);
        // // //##
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

        renderer.drawRegisteredObjects(view, projection, program2, [lightViewProjectionTextureMatrix, lightViewProjectionTextureMatrix2], false);
        // loop
        window.requestAnimationFrame(renderer.newFrame);
    }


    drawRegisteredObjects(view, projection, program, lightViewProjectionTextureMatrices, depthRendering){
        gl.depthFunc(gl.LESS);
        // local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
        gl.useProgram(program);

        // set uniforms common to all objects
        gl.uniform4f(program.u_color, color[0], color[1], color[2], color[3]);
        if(!depthRendering){
            // local space
            gl.uniform1f(program.u_bias, u_bias);
            light = utils.normalizeVector3(uniformLightPosition);
            gl.uniform3fv(program.u_reverseLightDirection, light);
            let secondarylight = utils.normalizeVector3(secondaryUniformLightPosition)
            gl.uniform3fv(program.u_secondaryLightDirection, secondarylight);
    
            // gl.uniform3fv(program.u_lightWorldPosition, pointLightPosition);
            gl.uniform3fv(program.u_cameraWorldPosition, [renderer.camera.x, renderer.camera.y, renderer.camera.z])
            // gl.uniform3fv(program.u_uniformLightColor, uniformLightColor);
            // gl.uniform3fv(program.u_pointLightColor, pointLightColor);
            // gl.uniform3fv(program.u_spotlightPosition, spotlightPosition);
            // gl.uniform3fv(program.u_spotlightDirection, spotlightDirection);
            // gl.uniform1f(program.u_spotlightInnerLimit, spotlightInnerLimit);
            // gl.uniform1f(program.u_spotlightOuterLimit, spotlightOuterLimit);
            gl.uniformMatrix4fv(program.u_lightViewProjectionTextureMatrix, true, lightViewProjectionTextureMatrices[0]);
            gl.uniformMatrix4fv(program.u_lightViewProjectionTextureMatrix2, true, lightViewProjectionTextureMatrices[1]);
            // gl.uniformMatrix4fv(program.u_lightViewProjectionTextureMatrix3, true, lightViewProjectionTextureMatrices[2]);
            gl.uniform1f(program.u_toonDiffuseThreshold, 0.5);
            gl.uniform1f(program.u_toonSpecularThreshold, 0.9);
            gl.uniform1f(program.u_roughness, u_roughness);
            // gl.uniform1f(program.u_spotlightPower, u_spotlightPower);
            // gl.uniform1f(program.u_decay, u_decay);
            // // camera space
            // gl.uniform1f(program.u_bias, u_bias);
            // light = utils.normalizeVector3(utils.multiplyMatrixVector(utils.transposeMatrix(utils.invertMatrix(view)), [uniformLightPosition[0], uniformLightPosition[1], uniformLightPosition[2], 1]));
            // gl.uniform3fv(program.u_reverseLightDirection, light);
            // let secondarylight = utils.normalizeVector3(utils.multiplyMatrixVector(utils.transposeMatrix(utils.invertMatrix(view)), [secondaryUniformLightPosition[0], secondaryUniformLightPosition[1], secondaryUniformLightPosition[2], 1]))
            // gl.uniform3fv(program.u_secondaryLightDirection, secondarylight);
    
            // gl.uniform3fv(program.u_lightWorldPosition, pointLightPosition);
            // gl.uniform3fv(program.u_cameraWorldPosition, [renderer.camera.x, renderer.camera.y, renderer.camera.z])
            // gl.uniform3fv(program.u_uniformLightColor, uniformLightColor);
            // gl.uniform3fv(program.u_pointLightColor, pointLightColor);
            // gl.uniform3fv(program.u_spotlightPosition, spotlightPosition);
            // gl.uniform3fv(program.u_spotlightDirection, spotlightDirection);
            // gl.uniform1f(program.u_spotlightInnerLimit, spotlightInnerLimit);
            // gl.uniform1f(program.u_spotlightOuterLimit, spotlightOuterLimit);
            // gl.uniformMatrix4fv(program.u_textureMatrix, true, utils.multiplyMatrices(utils.invertMatrix(utils.multiplyMatrices(worldMatrix, view)), lightViewProjectionTextureMatrices[0]));
            // gl.uniformMatrix4fv(program.u_textureMatrix2, true, utils.multiplyMatrices(utils.invertMatrix(view), lightViewProjectionTextureMatrices[1]));
            // gl.uniformMatrix4fv(program.u_lightViewProjectionTextureMatrix3, true, lightViewProjectionTextureMatrices[2]);
            // gl.uniform1f(program.u_toonDiffuseThreshold, 0.5);
            // gl.uniform1f(program.u_toonSpecularThreshold, 0.9);
            // gl.uniform1f(program.u_roughness, u_roughness);
            // gl.uniform1f(program.u_spotlightPower, u_spotlightPower);
            // gl.uniform1f(program.u_decay, u_decay);
        }
        

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
        for(let i=0; i<this.objects.length; i++){
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
            // local space
            gl.uniformMatrix4fv(program.u_worldViewProjectionMatrix, true, worldViewProjectionMatrix);
            // // camera space
            // gl.uniformMatrix4fv(program.u_projectionMatrix, true, projection);
            // if(!depthRendering){
            //     gl.uniformMatrix4fv(program.u_textureMatrix, true, lightViewProjectionTextureMatrices[0]);
            //     gl.uniformMatrix4fv(program.u_textureMatrix2, true, lightViewProjectionTextureMatrices[1]);
            // }
            if(!depthRendering){
                // local space
                gl.uniformMatrix4fv(program.u_inverseTransposeWorldMatrix, true, inverseTransposeWorldMatrix);
                gl.uniformMatrix4fv(program.u_worldMatrix, true, worldMatrix);

                // camera space
                //---
                //---
                if(model.textureIndex == -1){
                    gl.uniform1f(program.u_colorOpacity, 1.0);
                    gl.uniform1f(program.u_textureOpacity, 0.0);
                    // gl.uniform1f(program.u_ambientOpacity, 0.0);
                }
                else{
                    gl.uniform1f(program.u_colorOpacity, 0.0);
                    gl.uniform1f(program.u_textureOpacity, 1.0);
                    // gl.uniform1f(program.u_ambientOpacity, 0.0);
                }
                gl.uniform1i(program.u_depthTexture, depthTextureIndex);
                gl.uniform1i(program.u_depthTexture2, depthTextureIndex2);
                // gl.uniform1i(program.u_depthTexture3, depthTextureIndex3);
                gl.uniform1i(program.u_texture, objectTextureIndex);
                gl.uniform1i(program.u_cubeTexture, cubeTextureIndex); // local space

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
                if(model.textureIndex != -1){
                    gl.bindTexture(gl.TEXTURE_2D, renderer.textures[model.textureIndex]);
                }
                // gl.activeTexture(gl.TEXTURE0 + cubeTextureIndex);
                // gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
            }
            // draw with local space calculations
            gl.bindVertexArray(model.vao);
            gl.drawElements(gl.TRIANGLES, model.model.indices.length, gl.UNSIGNED_SHORT, 0);
            gl.bindVertexArray(null);
            // // draw with camera space calculations
            // // gl.bindVertexArray(model.vao);
            // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
            // // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
            // let vertexBuffer = gl.createBuffer();
            // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            // let worldSpaceVertices = this.applyMatrixToVertexArray(worldMatrix, new Float32Array(model.model.vertices));
            // let cameraSpaceVertices = this.convertLineArrayToCameraSpace(view, worldSpaceVertices);
            // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cameraSpaceVertices), gl.STATIC_DRAW);
            // gl.vertexAttribPointer(program.a_cam_position, 3, gl.FLOAT, false, 0, 0);
            // gl.enableVertexAttribArray(program.a_cam_position);
            // if(!depthRendering){
            //     let normalBuffer = gl.createBuffer();
            //     gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            //     let worldSpaceNormals = this.applyMatrixToVectorArray(worldMatrix, new Float32Array(model.model.vertexNormals));
            //     let cameraSpaceNormals = this.convertVectorsToCameraSpace(view, worldSpaceNormals);
            //     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cameraSpaceNormals), gl.STATIC_DRAW);
            //     gl.vertexAttribPointer(program.a_cam_normal, 3, gl.FLOAT, false, 0, 0);
            //     gl.enableVertexAttribArray(program.a_cam_normal);
            //     gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
            //     // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.textures), gl.STATIC_DRAW);
            //     gl.vertexAttribPointer(program.a_textureCoordinates, 2, gl.FLOAT, false, 0, 0);
            //     gl.enableVertexAttribArray(program.a_textureCoordinates);
            // }
            
            // gl.drawElements(gl.TRIANGLES, model.model.indices.length, gl.UNSIGNED_SHORT, 0);
            // // gl.bindVertexArray(null);
        }
        if(document.getElementById('draw_background').checked){
            this.drawBackground(viewProjectionMatrix);
        }
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
        // var wvpMatrix_1 = utils.multiplyMatrices(projection, view);
        // gl.uniformMatrix4fv(program.u_worldViewProjectionMatrix, false, utils.transposeMatrix(wvpMatrix_1));
        // calculations in camera space
        gl.uniformMatrix4fv(program.u_inverseViewMatrix, false, utils.invertMatrix(view));
        gl.uniformMatrix4fv(program.u_projectionMatrix, false, projection);
        // gl.bindVertexArray(lineVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
        let worldLines = lines.slice();
        let cameraLines = [];
        for(let i=0; i<6; i++){
            let worldSpacePoint = [worldLines[0+i*3], worldLines[1+i*3], worldLines[2+i*3], 1];

            let cameraSpacePoint = utils.multiplyMatrixVector(view, worldSpacePoint);
            for(let j=0; j<3; j++){
                cameraLines[j+i*3] = cameraSpacePoint[j];
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cameraLines), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.a_cam_position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_cam_position);
        gl.drawArrays(gl.LINES, 0, 6);
        // gl.bindVertexArray(null);
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
        // if(document.getElementById("quaternionRotation").checked){
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
        // }
        // else{ // non quaternion rotation deprecated
        //     object.orientationDeg[0] += rvx;
        //     object.orientationDeg[1] += rvy;
        //     object.orientationDeg[2] += rvz;
        // }
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
	    let yt = Math.floor(currentFrame / 14);
	    let xt = Math.floor(currentFrame % 14);
	    let scale = utils.MakeScaleMatrix(1/14);
	    let translate = utils.MakeTranslateMatrix(xt * 1/14, (1 - 1/7) - yt * 1/7, 0);
	    out = utils.multiplyMatrices(translate, scale)

	    return out;
    }


    animateRotation(time){
        return new Quaternion.fromEuler(0, 0, time);
    }


    addCollectibles(){
        let len = renderer.objects.length;
        let count = 0;
        for(let i=0; i<len; i++){
            if(renderer.objects[i].type == 'square' || renderer.objects[i].type == 'cylinder'){ // put rocks only on islands
                if(Math.random() < worldSettings['collectibleProbability']){
                    count += 1;
                    let position = renderer.objects[i].position.slice();
                    position[1] += ((renderer.models.filter(item=>item.name == renderer.objects[i].type)[0]['collisionData'][1]) * (renderer.objects[i].scale));
                    position[1] += 1;
                    renderer.addObject('rock_'+renderer.objects.length, 'rock', position)
                }
            }
        }
        return count;
    }

    addDecorations(){
        var islands = renderer.objects.filter(item=>item.type == 'square' || item.type == 'cylinder');
        let decorations;
        decorations = renderer.models.filter(item=>item.name != 'square' && item.name != 'cylinder' && item.name != 'ghost' && item.name != 'rock');
        let modelSquare;
        modelSquare = renderer.models.filter(i=>i.name == 'square')[0];
        let modelCylinder;
        modelCylinder = renderer.models.filter(i=>i.name == 'cylinder')[0];
        for(let i=0; i<islands.length; i++){
            let position = islands[i].position.slice();
            let sizeX = islands[i].type == 'square' ? modelSquare['collisionData'][0] * islands[i].scale : modelCylinder['collisionData'][0] * islands[i].scale;
            sizeX *= worldSettings['decorationRadius'];
            position[0] += Math.random() * sizeX - sizeX / 2;
            let sizeZ = islands[i].type == 'square' ? modelSquare['collisionData'][2] * islands[i].scale : modelCylinder['collisionData'][2] * islands[i].scale;
            sizeZ *= worldSettings['decorationRadius'];
            position[2] +=  Math.random() * sizeZ - sizeZ / 2;
            let sizeY = islands[i].type == 'square' ? modelSquare['collisionData'][1] * islands[i].scale : modelCylinder['collisionData'][1] * islands[i].scale
            position[1] += sizeY;
            let item = decorations[Math.floor(Math.random() * decorations.length)].name;
            if(item == 'cloud'){
                position[1] += sizeY;
            }
            renderer.addObject('decoration_'+renderer.objects.length, item, position);
        }
    }

    createRandomLevel(){
        renderer.deleteEverything();
        renderer.addObject('starting_island', 'square', [0,0,0]);
        renderer.addObject('ghost', 'ghost', [0,50,0]);
        for(let i=0; i<10; i++){
            renderer.addObject('square_island_'+renderer.objects.length, "square", [Math.floor(Math.random() * worldSettings['gameAreaSize']) - worldSettings['gameAreaSize']/2, Math.floor(Math.random() * worldSettings['gameAreaSize']/5), Math.floor(Math.random() * worldSettings['gameAreaSize']) - worldSettings['gameAreaSize']/2])
        }
        for(let i=0; i<5; i++){
            renderer.addObject('round_island_'+renderer.objects.length, "cylinder", [Math.floor(Math.random() * worldSettings['gameAreaSize']) - worldSettings['gameAreaSize']/2, Math.floor(Math.random() * worldSettings['gameAreaSize']/5), Math.floor(Math.random() * worldSettings['gameAreaSize']) - worldSettings['gameAreaSize']/2])
        }
        renderer.addDecorations();
        renderer.addCollectibles();
    }

    saveGame(slot){
        savedGames[slot] = renderer.objects;
        console.log('game saved to slot', slot)

    }
    loadGame(slot){
        renderer.deleteEverything();
        savedGames[slot].forEach(item=>renderer.addObject(item.name, item.type, item.position, item.orientation, item.orientationDeg, item.scale))
        if(!renderer.objects){console.log('this slot is empty')}
    }


    convertLineArrayToCameraSpace(viewMatrix, worldLines){
        let cameraPoints = [];
        for(let i=0; i<worldLines.length/3; i++){
            let worldSpacePoint = [worldLines[0+i*3], worldLines[1+i*3], worldLines[2+i*3], 1];
            let cameraSpacePoint = utils.multiplyMatrixVector(viewMatrix, worldSpacePoint);
            for(let j=0; j<3; j++){
                cameraPoints[j+i*3] = cameraSpacePoint[j];
            }
        }
        return cameraPoints;
    }
    convertVectorsToCameraSpace(viewMatrix, worldLines){
        let cameraPoints = [];
        for(let i=0; i<worldLines.length/3; i++){
            let worldSpacePoint = [worldLines[0+i*3], worldLines[1+i*3], worldLines[2+i*3], 1];
            let cameraSpacePoint = utils.multiplyMatrixVector(utils.transposeMatrix(utils.invertMatrix(viewMatrix)), worldSpacePoint);
            for(let j=0; j<3; j++){
                cameraPoints[j+i*3] = cameraSpacePoint[j];
            }
        }
        return cameraPoints;
    }
    applyMatrixToVertexArray(matrix, inputPoints){
        let outputPoints = [];
        for(let i=0; i<inputPoints.length/3; i++){
            let inputSpacePoint = [inputPoints[0+i*3], inputPoints[1+i*3], inputPoints[2+i*3], 1];
            let outputSpacePoint = utils.multiplyMatrixVector(matrix, inputSpacePoint);
            for(let j=0; j<3; j++){
                outputPoints[j+i*3] = outputSpacePoint[j];
            }
        }
        return outputPoints;
    }
    applyMatrixToVectorArray(matrix, inputPoints){
        let outputPoints = [];
        for(let i=0; i<inputPoints.length/3; i++){
            let inputSpacePoint = [inputPoints[0+i*3], inputPoints[1+i*3], inputPoints[2+i*3], 1];
            let outputSpacePoint = utils.multiplyMatrixVector(utils.transposeMatrix(utils.invertMatrix(matrix)), inputSpacePoint);
            for(let j=0; j<3; j++){
                outputPoints[j+i*3] = outputSpacePoint[j];
            }
        }
        return outputPoints;
    }
}
