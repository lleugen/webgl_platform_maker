class Sprite{
    constructor(p){
        this.position = p;
        this.forwardSpeed = 0;
        this.rightSpeed = 0;
    }
    // startMove(direction){
    //     this.moving = direction;
    // }
    // stopMove(){
    //     this.moving = 'stop';
    // }
    triggerMove(){
        // renderer.updateOrientation(renderer.objects.filter(item => item.name.includes('ghost'))[0], 0, 90, 0)
        // let camSpaceOrientation = Quatertion.fromEuler(90, 0, 0);
        
        

        let len = Math.sqrt(this.forwardSpeed**2 + this.rightSpeed**2);
        if(len != 0){
            let rvy = this.rightSpeed > 0 ? Math.asin(this.forwardSpeed / len)+ Math.PI : -Math.asin(this.forwardSpeed / len);
            rvy = rvy / Math.PI * 180;
            console.log(rvy)
            let dq2 = new Quaternion(Math.cos(rvy/2/180*Math.PI),
                                        Math.sin(rvy/2/180*Math.PI)*0,
                                        Math.sin(rvy/2/180*Math.PI)*1,
                                        Math.sin(rvy/2/180*Math.PI)*0);
            dq2.normalize();

            let viewMatrixWithAlignedUp = utils.MakeView(renderer.camera.x, renderer.camera.y, renderer.camera.z, 0, -renderer.camera.angle);
            let camera_matrix = utils.invertMatrix(viewMatrixWithAlignedUp);

            // let worldSpaceOrientation = utils.multiplyMatrices(camera_matrix, rotation);

            let worldrot = utils.multiplyMatrices(camera_matrix, dq2.toMatrix4());
            // console.log(camera_matrix, dq2.toMatrix4(), worldrot);
            let w = Math.sqrt(1 + worldrot[0] + worldrot[5] + worldrot[10]) / 2;
            let x = (worldrot[9] + worldrot[6]) / (4 * w);
            let y = (worldrot[2] - worldrot[8]) / (4 * w);
            let z = (worldrot[4] - worldrot[1]) / (4 * w);
            let worldquatrot = new Quaternion(w, x, y, z);
            console.log(w, x, y, z);
            let spriteobj = renderer.objects.filter(item => item.name.includes("ghost"))[0];
            // spriteobj.orientation = dq2.normalize();
            spriteobj.orientation = worldquatrot;
        }
        
        
        this.move(this.rightSpeed, 0, -this.forwardSpeed);
    }
    move(dx, dy, dz){
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
        // console.log(world_position, camera_position, translation, new_camera_position)
    }
}