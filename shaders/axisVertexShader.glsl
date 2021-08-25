#version 300 es
// an attribute will receive data from a buffer
in vec3 a_position;
uniform mat4 u_worldViewProjectionMatrix;

out vec3 fs_pos;

// all shaders have a main function
void main() {
    fs_pos = a_position;
    gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1);
}