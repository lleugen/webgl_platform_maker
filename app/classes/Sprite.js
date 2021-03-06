class Sprite{
    constructor(p){
        this.position = p;
        this.forwardSpeed = 0;
        this.rightSpeed = 0;
        this.upSpeed = 0;
        this.object = renderer.objects.filter(item => item.name.includes("ghost"))[0];
        this.gravityTime;
        this.baseHeight = 0;
        this.jump = false;
    }


    gravity(time){
        if(this.gravityTime){
            let deltaT = time - this.gravityTime;
            let deltaSpeed = deltaT**2 * worldSettings['gForce'];

            this.upSpeed = this.jump ? worldSettings['jumpPower'] - deltaSpeed : - deltaSpeed;

            if(this.position[1] <= this.baseHeight){
                this.upSpeed = 0;
                this.gravityTime = null;
                this.jump = false;
                // this.position[1] = this.baseHeight;
            }
        }
    }


    triggerMove(){
        // total speed
        let len = Math.sqrt(this.forwardSpeed**2 + this.rightSpeed**2);
        // calculate movement direction and rotate the model to face forward
        if(len != 0){
            let moveDirection = this.rightSpeed > 0 ? Math.asin(this.forwardSpeed / len) + Math.PI : -Math.asin(this.forwardSpeed / len);
            moveDirection = moveDirection / Math.PI * 180;
            let moveDirectionQuaternion = new Quaternion(Math.cos(moveDirection/2/180*Math.PI),
                                                        Math.sin(moveDirection/2/180*Math.PI)*0,
                                                        Math.sin(moveDirection/2/180*Math.PI)*1,
                                                        Math.sin(moveDirection/2/180*Math.PI)*0);
            moveDirectionQuaternion.normalize();
            let viewMatrixWithAlignedUp = utils.MakeView(renderer.camera.x, renderer.camera.y, renderer.camera.z, 0, -renderer.camera.angle);
            let camera_matrix = utils.invertMatrix(viewMatrixWithAlignedUp);
            let rotation_worldSpace = utils.multiplyMatrices(camera_matrix, moveDirectionQuaternion.toMatrix4());
            // convert matrix to quaternion
            let w = Math.sqrt(1 + rotation_worldSpace[0] + rotation_worldSpace[5] + rotation_worldSpace[10]) / 2;
            let x, y, z;
            if(w != 0){
                x = (rotation_worldSpace[9] + rotation_worldSpace[6]) / (4 * w);
                y = (rotation_worldSpace[2] - rotation_worldSpace[8]) / (4 * w);
                z = (rotation_worldSpace[4] - rotation_worldSpace[1]) / (4 * w);
            }
            else{
                x = (rotation_worldSpace[9] + rotation_worldSpace[6]) / (4 * 1);
                y = (rotation_worldSpace[2] - rotation_worldSpace[8]) / (4 * 1);
                z = (rotation_worldSpace[4] - rotation_worldSpace[1]) / (4 * 1);
            }
            let rotation_worldSpace_quaternion = new Quaternion(w, x, y, z);
            let spriteobj = renderer.objects.filter(item => item.name.includes("ghost"))[0];
            spriteobj.orientation = rotation_worldSpace_quaternion;


            // // the ghost has a spotlight
            // // facing direction in camera space
            // spotlightDirection = utils.normalizeVector3([-Math.cos(moveDirection / 180 * Math.PI), 0, Math.sin(moveDirection / 180 * Math.PI)])
            // // facing direction in world space
            // let spotlightDirectionHomogeneous = utils.multiplyMatrixVector(utils.transposeMatrix(utils.invertMatrix(camera_matrix)), [spotlightDirection[0], spotlightDirection[1], spotlightDirection[2], 1]);
            // spotlightDirection = utils.normalizeVector3(spotlightDirectionHomogeneous.slice(0,3));
            // spotlightPosition = this.position.slice();
            // spotlightPosition[1] += 5;
        }

        if(this.rightSpeed != 0 || this.forwardSpeed != 0 || this.upSpeed != 0){
            this.move(this.rightSpeed, this.upSpeed, -this.forwardSpeed);

            let objects = renderer.objects.filter(item=>!(item.name.includes('ghost')));
            let collisions1D;
            let hasSupport = false;
            for(let i=0; i<objects.length; i++){
                collisions1D = this.calculateCollision(this.object, objects[i]);
                if(collisions1D[0] && collisions1D[2]){ // if standing on the object
                    hasSupport = true;
                }
            }
            if(!hasSupport && this.baseHeight != 0){
                this.baseHeight = 0;
                if(!this.gravityTime){this.gravityTime = renderer.g_time;}
            }
        }

    }


    move(dx, dy, dz){
        if(dx != 0 || dz != 0){
            // let normalizedSpeed = utils.normalizeVector3([dx,dy,dz]);
            dx = dx / Math.sqrt(dx**2 + dz**2);
            // dy = normalizedSpeed[1];
            dz = dz / Math.sqrt(dx**2 + dz**2);
        }
        dx *= this.object.scale /4;
        dy *= this.object.scale /4;
        dz *= this.object.scale /4;

        // camera position in world space -> view matrix -> position in camera space -> transformation -> camera matrix (inverse view matrix) -> position in world space
        let world_position = [this.position[0], this.position[1], this.position[2], 1];
        let viewMatrixWithAlignedUp = utils.MakeView(renderer.camera.x, renderer.camera.y, renderer.camera.z, 0, -renderer.camera.angle)
        let camera_position = utils.multiplyMatrixVector(viewMatrixWithAlignedUp, world_position);
        let translation = utils.MakeTranslateMatrix(dx, dy, dz);
        let new_camera_position = utils.multiplyMatrixVector(translation, camera_position);
        let camera_matrix = utils.invertMatrix(viewMatrixWithAlignedUp);
        new_camera_position = utils.multiplyMatrixVector(camera_matrix, new_camera_position);
        this.position[0] = new_camera_position[0];
        this.position[1] = new_camera_position[1];
        this.position[2] = new_camera_position[2];
    }

    // a and b are objects
    calculateCollision(a, b){
        let model_a = renderer.models.filter(item=>item.name == a.type)[0];
        let model_b = renderer.models.filter(item=>item.name == b.type)[0];
        let collisions1D = [];
        collisions1D[0] = Math.abs((model_a['collisionData'][3][0] + a.position[0]) - (model_b['collisionData'][3][0] + b.position[0])) <= (model_a['collisionData'][0]*a.scale/2 + model_b['collisionData'][0]*b.scale/2);
        // collisions1D[1] = Math.abs(((model_a['collisionData'][3][1] + model_a['collisionData'][1]*a.scale/2) + a.position[1]) - ((model_b['collisionData'][3][1] + model_b['collisionData'][1]*b.scale/2) + b.position[1])) < (model_a['collisionData'][1]*a.scale/2 + model_b['collisionData'][1]*b.scale/2);
        let y_collision = false;
        let violation_y;
        if(a.position[1] >= b.position[1]){ // a is above b
            if(/*model_a['collisionData'][1] * a.scale +*/ a.position[1] < b.position[1] + model_b['collisionData'][1] * b.scale){
                y_collision = true;
                violation_y = model_b['collisionData'][1] * b.scale + b.position[1] - (a.position[1] - model_a['collisionData'][1]*a.scale/2);
            }
        }else{
            if(model_a['collisionData'][1] * a.scale + a.position[1] > b.position[1]){
                y_collision = true;
                violation_y = model_a['collisionData'][1] * a.scale + a.position[1] - b.position[1];
            }
        }
        collisions1D[1] = y_collision;
        collisions1D[2] = Math.abs((model_a['collisionData'][3][2] + a.position[2]) - (model_b['collisionData'][3][2] + b.position[2])) <= (model_a['collisionData'][2]*a.scale/2 + model_b['collisionData'][2]*b.scale/2);
        if(collisions1D.every(item=>item)){
            let violation_x = - Math.abs((model_a['collisionData'][3][0] + a.position[0]) - (model_b['collisionData'][3][0] + b.position[0])) + (model_a['collisionData'][0]*a.scale/2 + model_b['collisionData'][0]*b.scale/2);
            // let violation_y = (model_a['collisionData'][1]*a.scale/2 + model_b['collisionData'][1]*b.scale/2) - Math.abs(((model_a['collisionData'][3][1] + model_a['collisionData'][1]*a.scale/2) + a.position[1]) - ((model_b['collisionData'][3][1] + model_b['collisionData'][1]*b.scale/2) + b.position[1]));//Math.abs(a.position[1] - b.position[1]);
            let violation_z = (model_a['collisionData'][2]*a.scale/2 + model_b['collisionData'][2]*b.scale/2) - Math.abs((model_a['collisionData'][3][2] + a.position[2]) - (model_b['collisionData'][3][2] + b.position[2]));
            let min = Math.min(violation_x, violation_y, violation_z);
            switch(min){
                case violation_x:
                    if(renderer.sprite.position[0] < b.position[0]){
                        renderer.sprite.position[0] -= violation_x;
                    }
                    else{
                        renderer.sprite.position[0] += violation_x;
                    }
                    break;
                case violation_y:
                    if(renderer.sprite.position[1] < b.position[1]){
                        renderer.sprite.position[1] -= violation_y;
                    }
                    else{
                        renderer.sprite.position[1] += violation_y;
                    }
                    break;
                case violation_z:
                    if(renderer.sprite.position[2] < b.position[2]){
                        renderer.sprite.position[2] -= violation_z;
                    }
                    else{
                        renderer.sprite.position[2] += violation_z;
                    }
                    break;
            }
        }
        if(collisions1D.every(item=>item)){
            if(b.type == 'rock'){
                renderer.deleteObject(b.name);
                this.addLore();
                color = [Math.random(), Math.random(), Math.random(), 1.0];
            }
            if(this.gravityTime){
                renderer.sprite.baseHeight = FP_margin + model_b['collisionData'][1] * b.scale + b.position[1] + model_a['collisionData'][1]*a.scale/2;
                renderer.sprite.position[1] = renderer.sprite.baseHeight;
            }
            
        }
        return(collisions1D);
    }


    addLore(){
        let row = document.getElementById('loreRow');
        row.innerHTML = loreItems[Math.floor(Math.random() * loreItems.length)];
    }
}
