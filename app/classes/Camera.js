class Camera{
    constructor(){
        this.x = cameraParameters['x'];
        this.y = cameraParameters['y'];
        this.z = cameraParameters['z'];
        this.elevation = cameraParameters['elevation'];
        this.angle = cameraParameters['angle'];
        this.viewMatrix = [];
        this.projectionMatrix = [];
    }
    view(){
        if(!play_state){
            switch(cameraType){
                case 'lookAt1': // look at point from fixed distance, control camera position
                    renderer.camera.z = cameraParameters['radius'] * Math.cos(utils.degToRad(-renderer.camera.angle)) * Math.cos(utils.degToRad(-renderer.camera.elevation)) + lookAtZ;
                    renderer.camera.x = cameraParameters['radius'] * Math.sin(utils.degToRad(-renderer.camera.angle)) * Math.cos(utils.degToRad(-renderer.camera.elevation)) + lookAtX;
                    renderer.camera.y = cameraParameters['radius'] * Math.sin(utils.degToRad(-renderer.camera.elevation)) + lookAtY;
                    this.viewMatrix = utils.MakeView(renderer.camera.x, renderer.camera.y, renderer.camera.z, renderer.camera.elevation, -renderer.camera.angle);
                    break;
                case 'lookDirection': // first person camera view
                    this.viewMatrix = utils.MakeView(this.x, this.y, this.z, this.elevation, this.angle);
                    break;
            }
        }
        else{
            renderer.camera.z = cameraParameters['radius'] * Math.cos(utils.degToRad(-renderer.camera.angle)) * Math.cos(utils.degToRad(-renderer.camera.elevation)) + renderer.sprite.position[2];
            renderer.camera.x = cameraParameters['radius'] * Math.sin(utils.degToRad(-renderer.camera.angle)) * Math.cos(utils.degToRad(-renderer.camera.elevation)) + renderer.sprite.position[0];
            renderer.camera.y = cameraParameters['radius'] * Math.sin(utils.degToRad(-renderer.camera.elevation)) + renderer.sprite.position[1];
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

    createProjection(projectionType){
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
          projectionMatrix = utils.MakePerspective(fov,2,nearPlane,farPlane);
        }
        return projectionMatrix;
    }
}
