class staticObjectRenderer{
    constructor(){
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
        let vertexBuffer;
        vertexBuffer = gl.createBuffer();
        let indexBuffer;
        indexBuffer = gl.createBuffer();
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

        let newModel = {'name': name,
                        'model': model,
                        'program': program,
                        'vertexBuffer': vertexBuffer,
                        'indexBuffer': indexBuffer};
        this.models.push(newModel);
        inputElementsManager.drawCreateButton(name)   
    }


    addObject(name, type, position=[0,0,0], orientation=new Quaternion(), orientationDeg=[0,0,0], scale=1){
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


    deleteObject(name){
        this.objects = this.objects.filter(function(object){return object.name != name});
        inputElementsManager.deleteButton(name);
        inputElementsManager.deleteButton('delete '+name);
        console.log('deleted', name, this.objects);
    }


    drawObjects(){
        let i;
        let worldMatrix;

        for(i=0; i<this.objects.length; i++){
            let q = this.objects[i].orientation
            let rotation_matrix;
            if(document.getElementById("quaternionRotation").checked){
                // rotation_matrix = [1.0 - 2.0*q.y*q.y - 2.0*q.z*q.z,     2.0*q.x*q.y + 2.0*q.w*q.z,          2.0*q.x*q.z - 2.0*q.w*q.y,   0.0,
                //                    2.0*q.x*q.y - 2.0*q.w*q.z,           1.0 - 2.0*q.x*q.x - 2.0*q.z*q.z,    2.0*q.y*q.z + 2.0*q.w*q.x,   0.0,
                //                    2.0*q.x*q.z + 2.0*q.w*q.y,           2.0*q.y*q.z - 2.0*q.w*q.x,          1.0 - 2.0*q.x*q.x - q.y*q.y, 0.0,	
                //                    0.0,                                 0.0,                                0.0,                         1.0];
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


    draw(){
        viewMatrix = renderer.camera.view();
    
        projectionMatrix = createProjection(projectionType);
      
        if(document.getElementById('xz_plane').checked){
            renderer.drawYplane();
        }
        if(document.getElementById('draw_axis').checked){
            renderer.drawAxisLines();
        }
        renderer.drawObjects();
        
        window.requestAnimationFrame(renderer.draw);
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


    updateOrientation(rvx, rvy, rvz){
        let object = renderer.objects.filter(i=>i.name==focusedObjectName)[0];
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
        


        // code for extracting quaternions from rotation matrix
        // let rotation_matrix = [1 - 2*q.y**2 - 2*q.z**2, 2*q.x*q.y + 2*q.w*q.z, 2*q.x*q.z - 2*q.w*q.y, 0,
        // 					2*q.x*q.y - 2*q.w*q.z, 1 - 2*q.x**2 - 2*q.z**2, 2*q.y*q.z + 2*q.w*q.x, 0,
        // 					2*q.x*q.z + 2*q.w*q.y, 2*q.y*q.z - 2*q.w*q.x, 1 - 2*q.x**2 - q.y**2, 0,	
        // 					0, 0, 0, 1];
        // console.log(rotation_matrix[8])
        // if(rotation_matrix[8] != 1 && rotation_matrix[8] != -1){
        // 	y1 = -Math.asin(rotation_matrix[8]);
        // 	y2 = Math.PI - y1;
        // 	x1 = Math.atan2(rotation_matrix[9] / Math.cos(y1), rotation_matrix[10] / Math.cos(y1));
        // 	x2 = Math.atan2(rotation_matrix[9] / Math.cos(y2), rotation_matrix[10] / Math.cos(y2));
        // 	z1 = Math.atan2(rotation_matrix[4] / Math.cos(y1), rotation_matrix[0] / Math.cos(y1));
        // 	z2 = Math.atan2(rotation_matrix[4] / Math.cos(y2), rotation_matrix[0] / Math.cos(y2));
        // }
        // else{
        // 	console.log('r13 is +-1')
        // 	z1 = 0;
        // 	z2 = 0;
        // 	if(rotation_matrix[8] == -1){
        // 		y1 = Math.PI / 2;
        // 		y2 = Math.PI / 2;
        // 		x1 = z1 + Math.atan2(rotation_matrix[1], rotation_matrix[2]);
        // 		x2 = z2 + Math.atan2(rotation_matrix[1], rotation_matrix[2]);
        // 	}
        // 	else{
        // 		y1 = -Math.PI / 2;
        // 		y2 = -Math.PI / 2;
        // 		x1 = -z1 + Math.atan2(-rotation_matrix[1], -rotation_matrix[2]);
        // 		x2 = -z2 + Math.atan2(-rotation_matrix[1], -rotation_matrix[2]);
        // 	}
        // }
        // object = renderer.objects.filter(item=>item.name==focusedObjectName)[0]
        // object.orientation[0] += x1;
        // object.orientation[1] += y1;
        // object.orientation[2] += z1;
        // console.log(object.orientation)
    
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
        gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, lines.length/3);
    }
    
    
    
    drawYplane(){
        var wvpMatrix_1 = utils.multiplyMatrices(projectionMatrix, viewMatrix); // for program 1, used by plane and axis
        gl.useProgram(program);
        gl.uniformMatrix4fv(program.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix_1));
        var plane = [
            -10,0,-10,
            -10,0,10,
            10,0,-10,
            10,0,-10,
            -10,0,10,
            10,0,10,
        ]
        var planeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, plane.length/3);
    }
    
    
    drawModel(model, worldMatrix, program){
        gl.useProgram(program);
        // do buffers and data for every model
        // create vertex buffer
        // let vertexBuffer = gl.createBuffer();
        // // index buffer
        // let indexBuffer = gl.createBuffer();
        // console.log(model)
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectMesh.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectMesh.indices), gl.STATIC_DRAW);
    
    
        let s45 = 0.707106781186548;
        let gLightDir1 = [ 0.0, s45, s45, 1.0];
        gl.uniform4f(program.light, gLightDir1[0], gLightDir1[1], gLightDir1[2], gLightDir1[3]);
        let colors = [1, 0, 0]
        gl.uniform4f(program.matcol, colors[0], colors[1], colors[2], 1.0);
    
        //##############################################################
        // update W matrix
    
        // var worldMatrix = utils.MakeWorld(sliderValuex,sliderValuey,sliderValuez,worldAnglex,worldAngley,worldAnglez,1);
        //##############################################################
        //here we need to put the transforms: local coordinates -> world coordinates -> view coordinates -> screen coordinates -> normalize -> clip
        var wvpMatrix_1 = utils.multiplyMatrices(projectionMatrix, viewMatrix); // for program 1, used by plane and axis
        var wvpMatrix_2 = utils.multiplyMatrices(wvpMatrix_1, worldMatrix); // for program 2 used by ghost
    
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = model.model.indices.length;
    
    
        gl.uniformMatrix4fv(program.projection_uniform_location, false, utils.transposeMatrix(wvpMatrix_2));
        gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
    }
}

function createProjection(projectionType){
    // Make projection matrix
    if(projectionType == "orthogonal"){
      let w = cameraWindowWidth;
      let a = 2;
      let n = nearPlane;
      let f = farPlane;
      let orthogonal_projection =  [1/w,	0.0,		0.0,		0.0,
                              0.0,		a/w,		0.0,		0.0,
                              0.0,		0.0,		-2/(f-n),		-(f+n)/(f-n),
                              0.0,		0.0,		0.0,		1.0];
      projectionMatrix = orthogonal_projection;
    }
    else if(projectionType == "isometric"){
      let w = cameraWindowWidth;
      let a = 2;
      let n = nearPlane;
      let f = farPlane;
      let orthogonal_projection =  [1/w,	0.0,		0.0,		0.0,
                              0.0,		a/w,		0.0,		0.0,
                              0.0,		0.0,		-2/(f-n),		-(f+n)/(f-n),
                              0.0,		0.0,		0.0,		1.0];
      let cos_45 = Math.cos(45/180*Math.PI)
      let sin_45 = Math.sin(45/180*Math.PI)
      let cos_35 = Math.cos(-35.26/180*Math.PI)
      let sin_35 = Math.sin(-35.26/180*Math.PI)
      let x_rotation = [1, 0, 0, 0,
                0, cos_35, sin_35, 0,
                0, -sin_35, cos_35, 0,
                0, 0, 0, 1];
      
      let y_rotation = [cos_45, 0, sin_45, 0,
                0, 1, 0, 0,
                -sin_45, 0, cos_45, 0,
                0, 0, 0, 1];
      var A1 =  utils.multiplyMatrices(orthogonal_projection, x_rotation)
      projectionMatrix = utils.multiplyMatrices(A1, y_rotation)
    }
    else if(projectionType == "perspective"){
      // console.log(nearPlane, farPlane)
      projectionMatrix = utils.MakePerspective(fov,2,nearPlane,farPlane);
    }
    return projectionMatrix;
}
