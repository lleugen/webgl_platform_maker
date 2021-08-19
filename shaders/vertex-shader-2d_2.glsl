#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_worldViewProjectionMatrix;
uniform mat4 u_inverseTransposeWorldMatrix;

out vec3 var_normal;

void main() {
    gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1);
    var_normal = mat3(u_inverseTransposeWorldMatrix) * a_normal;
}