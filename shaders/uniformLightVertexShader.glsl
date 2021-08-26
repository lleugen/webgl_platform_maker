#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;
in vec2 a_textureCoordinates;

uniform mat4 u_worldViewProjectionMatrix;
uniform mat4 u_inverseTransposeWorldMatrix;
uniform vec3 u_lightWorldPosition;
uniform mat4 u_worldMatrix;
uniform vec3 u_cameraWorldPosition;
uniform vec3 u_spotlightPosition;
uniform mat4 u_lightViewProjectionTextureMatrix;
uniform mat4 u_textureAnimationMatrix;


out vec3 var_normal;
out vec3 var_surfaceToLightDirection; // point light
out vec3 var_surfacetoSpotlightDirection; // for spotlight
out vec3 var_surfaceToCameraDirection;
out vec2 var_textureCoordinates;
out vec4 var_projectedTexcoord;

void main() {
    gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1.0);
    var_normal = mat3(u_inverseTransposeWorldMatrix) * a_normal;
    vec4 worldPosition = u_worldMatrix * vec4(a_position, 1.0);
    // for point light
    vec3 pointWorldPosition = (u_worldMatrix * vec4(a_position, 1)).xyz;
    var_surfaceToLightDirection = u_lightWorldPosition - pointWorldPosition;

    // for spotlight
    var_surfacetoSpotlightDirection = u_spotlightPosition - pointWorldPosition;
    // for shininess
    var_surfaceToCameraDirection = u_cameraWorldPosition - pointWorldPosition;

    // texture
    var_textureCoordinates = (u_textureAnimationMatrix * vec4(a_textureCoordinates, 0.0, 1.0)).xy;
    var_textureCoordinates.y -= 0.5;
    var_projectedTexcoord = u_lightViewProjectionTextureMatrix * worldPosition;
}