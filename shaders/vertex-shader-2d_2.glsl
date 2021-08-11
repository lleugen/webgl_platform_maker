#version 300 es
// an attribute will receive data from a buffer
in vec3 a_position;
in vec3 in_normal;
uniform mat4 projection;
uniform mat4 u_world;

out vec3 var_normal;

out vec3 fs_pos;

// all shaders have a main function
void main() {
    fs_pos = (projection * vec4(a_position, 1)).xyz;
    gl_Position = projection * vec4(a_position, 1);
    var_normal = mat3(u_world) * in_normal;
}