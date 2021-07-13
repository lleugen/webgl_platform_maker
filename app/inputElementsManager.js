class InputElementsManager{
    constructor(){
        
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
        if(renderer == null){
            text.id = 'sample text'
        }
        else{
            text.id = "text"+renderer.models.length;
        }
        
        text.placeholder = 'object name';
        item = document.createElement('li');
        item.appendChild(text);
        item.appendChild(button);
        // button.onclick = function() {renderer.addObject(this.parentElement.children[0].value == '' ? this.innerHTML + '_' + renderer.objects.length : this.parentElement.children[0].value, // object name
        //                                                 this.innerHTML, // model name
        //                                                 [0,0,0], // position
        //                                                 new Quaternion())}; // orientation
        button.onclick = function() {toggleCreate = name == 'none' ? 'none' : this.innerHTML;}
        space.appendChild(item);
    }
    
    
    deleteButton(name){
        let button = document.getElementById(name);
        button.remove();
    }
}
