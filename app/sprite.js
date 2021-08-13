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