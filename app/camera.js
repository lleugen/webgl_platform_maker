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
        switch(cameraType){
            case 'lookAt1': // look at point from fixed distance, control camera position
                cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation)) + lookAtZ;
                cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation)) + lookAtX;
                cy = lookRadius * Math.sin(utils.degToRad(-elevation)) + lookAtY;
                this.viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
                break;
            case 'lookDirection':
                this.viewMatrix = utils.MakeView(this.x, this.y, this.z, this.elevation, this.angle);
                break;
        }
        return this.viewMatrix
    }


    // move in camera reference system: left/right, down/up, forwards/backwards
    move(dx, dy, dz){
        // camera position in world space -> view matrix -> position in camera space -> transformation -> camera matrix (inverse view matrix) -> position in world space
        let world_position = [this.x, this.y, this.z, 1];
        let viewMatrixWithAlignedUp = utils.MakeView(renderer.camera.x, renderer.camera.y, renderer.camera.z, 0, renderer.camera.angle)
        let camera_position = utils.multiplyMatrixVector(viewMatrixWithAlignedUp, world_position);
        let translation = utils.MakeTranslateMatrix(dx, dy, dz);
        let new_camera_position = utils.multiplyMatrixVector(translation, camera_position);
        let camera_matrix = utils.invertMatrix(viewMatrixWithAlignedUp);
        new_camera_position = utils.multiplyMatrixVector(camera_matrix, new_camera_position);
        this.x = new_camera_position[0];
        this.y = new_camera_position[1];
        this.z = new_camera_position[2];
        console.log(world_position, camera_position, translation, new_camera_position)
    }
    changeOrientation(de, da){
        this.elevation += de;
        this.angle += da;
    }
}
