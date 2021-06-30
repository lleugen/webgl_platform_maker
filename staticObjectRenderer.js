class staticObjectRenderer{
    constructor(){
        this.objects = [];
        this.models = {};
    }


    addObject(name, type, position, orientation){
        let newObject = {
            'name': name,
            'type': type,
            'position': position,
            'orientation': orientation
        }
        this.objects.push(newObject);
        this.drawButton(newObject.name);
    }


    addModel(name, model){
        this.models[name] = model;

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
            let model = this.models[this.objects[i].type];  
            drawModel(model, worldMatrix);
        }
    }


    drawNewObjectButtons(){
        this.drawButton('world');
        let i;
        let button;
        let text;
        let space = document.getElementById("list2");
        let keys = Object.keys(this.models);
        let item;
        // console.log(keys)
        
        for(i=0; i<keys.length; i++){
            button = document.createElement("button");
            button.innerHTML = keys[i];
            
            text = document.createElement("INPUT");
            text.size = 7;
            text.id = "text";
            text.placeholder = 'object name';

            item = document.createElement('li');
            item.appendChild(text);
            item.appendChild(button);
            button.onclick = function() {renderer.addObject(text.value == '' ? this.innerHTML + '_' + renderer.objects.length : text.value, this.innerHTML  , [0,0,0], [0,0,0])};
            space.appendChild(item);
        }
    }


    drawButton(name){
        let button;
        let buttonSpace = document.getElementById("buttons");

        button = document.createElement("button");
        button.innerHTML = name;
        button.onclick = function(){focusedObjectName = this.innerHTML}
        buttonSpace.appendChild(button);
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
        console.log(delta);
        object.position[0] = delta[0];
        object.position[1] = delta[1];
        object.position[2] = delta[2];
    }


    updateObjectMouse(name, dx, dz){
        // raycast on mouse down to id object and find intersection with y plane
        // use object selected with button for now

        // while mouse state update position
        let i;
        let object;
        for(i=0; i<this.objects.length; i++){
            if(this.objects[i].name == name){
                object = this.objects[i];
                console.log('object selected', object.)

            }
        }   
        object.position[0] = dx;
        object.position[2] = dz;

        
    }
}