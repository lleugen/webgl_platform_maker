class Camera{
    constructor(){
        this.x = 50;
        this.y = 10;
        this.z = 50;
        this.elevation = 0;
        this.angle = 45;
        this.viewMatrix = [];
    }
    view(){
        if(!play_state){
            switch(cameraType){
                case 'lookAt1': // look at point from fixed distance, control camera position
                    renderer.camera.z = lookRadius * Math.cos(utils.degToRad(-renderer.camera.angle)) * Math.cos(utils.degToRad(-renderer.camera.elevation)) + lookAtZ;
                    renderer.camera.x = lookRadius * Math.sin(utils.degToRad(-renderer.camera.angle)) * Math.cos(utils.degToRad(-renderer.camera.elevation)) + lookAtX;
                    renderer.camera.y = lookRadius * Math.sin(utils.degToRad(-renderer.camera.elevation)) + lookAtY;
                    this.viewMatrix = utils.MakeView(renderer.camera.x, renderer.camera.y, renderer.camera.z, renderer.camera.elevation, -renderer.camera.angle);
                    break;
                case 'lookDirection':
                    this.viewMatrix = utils.MakeView(this.x, this.y, this.z, this.elevation, this.angle);
                    break;
            }
        }
        else{
            renderer.camera.z = lookRadius * Math.cos(utils.degToRad(-renderer.camera.angle)) * Math.cos(utils.degToRad(-renderer.camera.elevation)) + renderer.sprite.position[2];
            renderer.camera.x = lookRadius * Math.sin(utils.degToRad(-renderer.camera.angle)) * Math.cos(utils.degToRad(-renderer.camera.elevation)) + renderer.sprite.position[0];
            renderer.camera.y = lookRadius * Math.sin(utils.degToRad(-renderer.camera.elevation)) + renderer.sprite.position[1];
            this.viewMatrix = utils.MakeView(renderer.camera.x, renderer.camera.y, renderer.camera.z, renderer.camera.elevation, -renderer.camera.angle);
        }
        
        return this.viewMatrix
    }


    // move in camera reference system: left/right, down/up, forwards/backwards
    move(dx, dy, dz){
        // camera position in world space -> view matrix -> position in camera space -> transformation -> camera matrix (inverse view matrix) -> position in world space
        let world_position = [this.x, this.y, this.z, 1];
        let viewMatrixWithAlignedUp = utils.MakeView(renderer.camera.x, renderer.camera.y, renderer.camera.z, 0, -renderer.camera.angle)
        let camera_position = utils.multiplyMatrixVector(viewMatrixWithAlignedUp, world_position);
        let translation = utils.MakeTranslateMatrix(dx, dy, dz);
        let new_camera_position = utils.multiplyMatrixVector(translation, camera_position);
        let camera_matrix = utils.invertMatrix(viewMatrixWithAlignedUp);
        new_camera_position = utils.multiplyMatrixVector(camera_matrix, new_camera_position);
        this.x = new_camera_position[0];
        this.y = new_camera_position[1];
        this.z = new_camera_position[2];
        // console.log(world_position, camera_position, translation, new_camera_position)
    }
    changeOrientation(de, da){
        this.elevation += de;
        this.angle += da;
    }
}
