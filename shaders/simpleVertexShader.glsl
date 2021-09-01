#version 300 es
// local space
in vec3 a_position;

uniform mat4 u_worldViewProjectionMatrix;

void main() {
  gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1.0);
}

// // camera space
// in vec3 a_cam_position;

// uniform mat4 u_projectionMatrix;

// void main() {
//   gl_Position = u_projectionMatrix * vec4(a_cam_position, 1.0);
// }