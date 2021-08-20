#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_worldViewProjectionMatrix;
uniform mat4 u_inverseTransposeWorldMatrix;
uniform vec3 u_lightWorldPosition;
uniform mat4 u_worldMatrix;
uniform vec3 u_cameraWorldPosition;
uniform vec3 u_spotlightPosition;


out vec3 var_normal;
out vec3 var_surfaceToLightDirection; // point light
out vec3 var_surfacetoSpotlightDirection; // for spotlight
out vec3 var_surfaceToCameraDirection;

void main() {
    gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1);
    var_normal = mat3(u_inverseTransposeWorldMatrix) * a_normal;

    // for point light
    vec3 pointWorldPosition = (u_worldMatrix * vec4(a_position, 1)).xyz;
    var_surfaceToLightDirection = u_lightWorldPosition - pointWorldPosition;

    // for spotlight
    var_surfacetoSpotlightDirection = u_spotlightPosition - pointWorldPosition;
    // for shininess
    var_surfaceToCameraDirection = u_cameraWorldPosition - pointWorldPosition;
}