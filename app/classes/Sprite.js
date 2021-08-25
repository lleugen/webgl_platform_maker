class Sprite{
    constructor(p){
        this.position = p;
        this.forwardSpeed = 0;
        this.rightSpeed = 0;
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


            // the ghost has a spotlight
            // facing direction in camera space
            spotlightDirection = utils.normalizeVector3([-Math.cos(moveDirection / 180 * Math.PI), 0, Math.sin(moveDirection / 180 * Math.PI)])
            // facing direction in world space
            let spotlightDirectionHomogeneous = utils.multiplyMatrixVector(utils.transposeMatrix(utils.invertMatrix(camera_matrix)), [spotlightDirection[0], spotlightDirection[1], spotlightDirection[2], 1]);
            spotlightDirection = utils.normalizeVector3(spotlightDirectionHomogeneous.slice(0,3));
            spotlightPosition = this.position;
        }
        
        this.move(this.rightSpeed, 0, -this.forwardSpeed);
    }


    move(dx, dy, dz){
        if(dx != 0 || dy != 0 || dz != 0){
            let normalizedSpeed = utils.normalizeVector3([dx,dy,dz]);
            dx = normalizedSpeed[0];
            dy = normalizedSpeed[1];
            dz = normalizedSpeed[2];
        }
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
}