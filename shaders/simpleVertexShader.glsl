#version 300 es
in vec3 a_position;
in vec3 a_normal;
in vec2 a_textureCoordinates;

// uniform mat4 u_projection;
// uniform mat4 u_view;
// uniform mat4 u_world;
uniform mat4 u_worldViewProjectionMatrix;

void main() {
  // Multiply the position by the matrices.
  gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1.0);
}