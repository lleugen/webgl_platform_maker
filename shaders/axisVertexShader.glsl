#version 300 es
precision highp float;

// // an attribute will receive data from a buffer
// in vec3 a_position; // in world space / in local space? they coincide because worldMatrix == identity
// uniform mat4 u_worldViewProjectionMatrix;

// out vec3 fs_pos;

// // all shaders have a main function
// void main() {
//     fs_pos = a_position;
//     gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1);
// }

// same thing but in camera space
in vec3 a_cam_position;
uniform mat4 u_projectionMatrix;
out vec4 fs_cam_pos;
void main(){
    fs_cam_pos = vec4(a_cam_position, 1.0);
    gl_Position = u_projectionMatrix * vec4(a_cam_position, 1.0);
}