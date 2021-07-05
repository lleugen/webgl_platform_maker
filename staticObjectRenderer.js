class staticObjectRenderer{
    constructor(){
        this.objects = [];
        this.models = [];
        this.drawSelectButton('world');
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
        this.drawCreateButton(name)   
    }


    addObject(name, type, position, orientation, scale=1){
        let newObject = {
            'name': name,
            'type': type, // model name
            'position': position,
            'orientation': orientation,
            'scale': scale
        }
        this.objects.push(newObject);
        this.drawSelectButton(newObject.name);
        this.drawDeleteButton(newObject.name);
        focusedObjectName = name;
        console.log('created new object', name)
    }


    deleteObject(name){
        this.objects = this.objects.filter(function(object){return object.name != name});
        this.deleteButton(name);
        this.deleteButton('delete '+name);
        console.log('deleted', name, this.objects);
    }


    drawObjects(){
        let i;
        let worldMatrix;
        for(i=0; i<this.objects.length; i++){
            worldMatrix = utils.MakeWorld(this.objects[i].position[0],
                this.objects[i].position[1],
                this.objects[i].position[2],
                this.objects[i].orientation[0],
                this.objects[i].orientation[1],
                this.objects[i].orientation[2],
                1);
            let model = this.models.filter(item => item.name == renderer.objects[i].type);
            model = model[0];
            this.drawModel(model, worldMatrix, model.program);
        }
    }


    draw(){
        // make view matrix
        cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
        cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
        cy = lookRadius * Math.sin(utils.degToRad(-elevation));
        viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
    
        projectionMatrix = createProjection(projectionType);
      
        // drawYplane();
        renderer.drawAxisLines();
        renderer.drawObjects();
        
        window.requestAnimationFrame(renderer.draw);
      }


    drawSelectButton(name){
        let button;
        let buttonSpace = document.getElementById("buttons(object control)");

        button = document.createElement("button");
        button.innerHTML = name;
        button.id = name;
        button.onclick = function(){focusedObjectName = this.innerHTML}
        buttonSpace.appendChild(button);
    }


    drawDeleteButton(name){
        // let button;
        let buttonSpace = document.getElementById("buttons(object control)");
        let button;

        button = document.createElement("button");
        button.innerHTML = 'delete ' + name;
        button.id = 'delete ' + name;
        button.onclick = function(){renderer.deleteObject(name);}
        buttonSpace.appendChild(button);
    }


    drawCreateButton(name){
        let button;
        let text;
        let space = document.getElementById("list2");
        // let keys = Object.keys(this.models);
        let item;
        // console.log(keys)
        button = document.createElement("button");
        button.innerHTML = name;
        text = document.createElement("INPUT");
        text.size = 7;
        text.id = "text"+this.models.length;
        text.placeholder = 'object name';
        item = document.createElement('li');
        item.appendChild(text);
        item.appendChild(button);
        button.onclick = function() {renderer.addObject(this.parentElement.children[0].value == '' ? this.innerHTML + '_' + renderer.objects.length : this.parentElement.children[0].value, this.innerHTML  , [0,0,0], [0,0,0])};
        space.appendChild(item);
    }


    deleteButton(name){
        let button = document.getElementById(name);
        button.remove();
    }


    updateObjectPosition(name, x, z, h){
        // raycast on mouse down to id object and find intersection with y plane
        // use object selected with button for now
        // while mouse state update position
        let i;
        let object;
        object = this.objects.filter(item=>item.name==name)[0]
        object.position[0] = x;
        object.position[2] = z;
        object.position[1] += h;
        // console.log('new position',object.position);
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
      projectionMatrix = utils.MakePerspective(45,2,nearPlane,farPlane);
    }
    return projectionMatrix;
  }