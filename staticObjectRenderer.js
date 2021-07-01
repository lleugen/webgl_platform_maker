class staticObjectRenderer{
    constructor(){
        this.objects = [];
        this.models = [];
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


    addModel(name, model){
        let vertexBuffer;
        vertexBuffer = gl.createBuffer();
        let indexBuffer;
        indexBuffer = gl.createBuffer();
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program2.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

        let newModel = {'name': name,
                        'model': model,
                        'vertexBuffer': vertexBuffer,
                        'indexBuffer': indexBuffer};
        this.models.push(newModel);
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
            drawModel(model, worldMatrix);
        }
    }


    drawNewObjectButtons(){
        this.drawSelectButton('world');
        let i;
        let button;
        let text;
        let space = document.getElementById("list2");
        // let keys = Object.keys(this.models);
        let item;
        // console.log(keys)
        
        for(i=0; i<this.models.length; i++){
            button = document.createElement("button");
            button.innerHTML = this.models[i].name;
            
            text = document.createElement("INPUT");
            text.size = 7;
            text.id = "text"+i;
            text.placeholder = 'object name';

            item = document.createElement('li');
            item.appendChild(text);
            item.appendChild(button);
            button.onclick = function() {renderer.addObject(this.parentElement.children[0].value == '' ? this.innerHTML + '_' + renderer.objects.length : this.parentElement.children[0].value, this.innerHTML  , [0,0,0], [0,0,0])};
            space.appendChild(item);
        }
    }


    drawSelectButton(name){
        let button;
        let buttonSpace = document.getElementById("buttons");

        button = document.createElement("button");
        button.innerHTML = name;
        button.id = name;
        button.onclick = function(){focusedObjectName = this.innerHTML}
        buttonSpace.appendChild(button);
    }


    drawDeleteButton(name){
        let button;
        let buttonSpace = document.getElementById("buttons");

        button = document.createElement("button");
        button.innerHTML = 'delete ' + name;
        button.id = 'delete ' + name;
        button.onclick = function(){renderer.deleteObject(name);}
        buttonSpace.appendChild(button);
    }


    deleteButton(name){
        let button = document.getElementById(name);
        button.remove();

    }


    updateObject(name){
        let i;
        let object;
        for(i=0; i<this.objects.length; i++){
            if(this.objects[i].name == name){
                object = this.objects[i];
            }
        }
        let delta = utils.multiplyMatrixVector(utils.invertMatrix(projectionMatrix), [sliderValuex - object.position[0],
                                                                        sliderValuey - object.position[1],
                                                                        sliderValuez - object.position[2],
                                                                        1])
        delta[0] = delta[0]/delta[3];
        delta[1] = delta[1]/delta[3];
        delta[2] = delta[2]/delta[3];
        delta[3] = delta[3]/delta[3];
        // delta = utils.multiplyMatrixVector(utils.invertMatrix(viewMatrix), delta)
        // console.log(delta);
        object.position[0] = delta[0];
        object.position[1] = delta[1];
        object.position[2] = delta[2];
    }


    updateObjectPosition(name, x, z){
        // raycast on mouse down to id object and find intersection with y plane
        // use object selected with button for now

        // while mouse state update position
        let i;
        let object;
        for(i=0; i<this.objects.length; i++){
            if(this.objects[i].name == name){
                object = this.objects[i];
                // console.log('object selected', object.name, object.position);
                break;
            }
        }   
        object.position[0] = x;
        object.position[2] = z;

        // console.log('new position',object.position);

        
    }


    updateObjectHeight(name, h){
        let i;
        let object;
        for(i=0; i<this.objects.length; i++){
            if(this.objects[i].name == name){
                object = this.objects[i];
                // console.log('object selected', object.name, object.position);
                break;
            }
        }   
        object.position[1] += h;
    }
}