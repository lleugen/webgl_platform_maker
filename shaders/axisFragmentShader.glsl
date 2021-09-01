#version 300 es
precision highp float;

      
// // fragment shaders don't have a default precision so we need
// // to pick one. mediump is a good default
// precision mediump float;
// out vec4 FragColor;
// in vec3 fs_pos;

// void main() {
//     // gl_FragColor is a special variable a fragment shader
//     // is responsible for setting
//     float red = (fs_pos.y == 0.0 && fs_pos.z == 0.0) ? 1.0 : 0.0;
//     float green = (fs_pos.x == 0.0 && fs_pos.z == 0.0) ? 1.0 : 0.0;
//     float blue = (fs_pos.x == 0.0 && fs_pos.y == 0.0) ? 1.0 : 0.0;
//     // FragColor = vec4(fs_pos.x/10.0, fs_pos.y/10.0, fs_pos.z/10.0, 1);
//     FragColor = vec4(red, green, blue, 1.0);
// }

// same thing but in camera space
out vec4 FragColor;
in vec4 fs_cam_pos;
uniform mat4 u_inverseViewMatrix;
void main(){
    vec4 world = u_inverseViewMatrix * fs_cam_pos;
    float red = world.y == 0.0 && world.z == 0.0 ? 1.0 : 0.0;
    float green = world.x == 0.0 && world.z == 0.0 ? 1.0 : 0.0;
    float blue = world.x== 0.0 && world.y == 0.0 ? 1.0 : 0.0;
    FragColor = vec4(red, green, blue, 1.0);
}