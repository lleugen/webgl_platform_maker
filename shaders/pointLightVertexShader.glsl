#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_worldViewProjectionMatrix;
uniform mat4 u_inverseTransposeWorldMatrix;
uniform vec3 u_lightWorldPosition;
uniform mat4 u_worldMatrix;

out vec3 var_normal;
out vec3 var_surfaceToLightDirection;

void main() {
    vec3 pointWorldPosition = (u_worldMatrix * vec4(a_position, 1)).xyz;
    var_surfaceToLightDirection = u_lightWorldPosition - pointWorldPosition;
    gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1);
    var_normal = mat3(u_inverseTransposeWorldMatrix) * a_normal;
}