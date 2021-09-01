#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;
in vec2 a_textureCoordinates;

uniform mat4 u_worldViewProjectionMatrix;
uniform mat4 u_inverseTransposeWorldMatrix;
uniform mat4 u_worldMatrix;
uniform vec3 u_cameraWorldPosition;
// uniform vec3 u_spotlightPosition;
uniform mat4 u_lightViewProjectionTextureMatrix;
uniform mat4 u_lightViewProjectionTextureMatrix2;
// uniform mat4 u_lightViewProjectionTextureMatrix3;
uniform mat4 u_textureAnimationMatrix;


out vec3 var_normal;
out vec3 var_surfacetoSpotlightDirection; // for spotlight
out vec3 var_surfaceToCameraDirection;
out vec2 var_textureCoordinates;
out vec4 var_projectedTexcoord;
out vec4 var_projectedTexcoord2;
// out vec4 var_projectedTexcoord3;


void main() {
    gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1.0);
    var_normal = mat3(u_inverseTransposeWorldMatrix) * a_normal;
    vec4 worldPosition = u_worldMatrix * vec4(a_position, 1.0);
    vec3 pointWorldPosition = (u_worldMatrix * vec4(a_position, 1)).xyz;
    // for spotlight
    // var_surfacetoSpotlightDirection = u_spotlightPosition - pointWorldPosition;
    // for shininess and oren nayar
    var_surfaceToCameraDirection = u_cameraWorldPosition - pointWorldPosition;
    // textures
    var_textureCoordinates = (u_textureAnimationMatrix * vec4(a_textureCoordinates, 0.0, 1.0)).xy;
    var_textureCoordinates.y -= 0.5;
    var_projectedTexcoord = u_lightViewProjectionTextureMatrix * worldPosition;
    var_projectedTexcoord2 = u_lightViewProjectionTextureMatrix2 * worldPosition;
    // var_projectedTexcoord3 = u_lightViewProjectionTextureMatrix3 * worldPosition;
}

// // the same calculations but in camera space
// in vec3 a_cam_position;
// in vec3 a_cam_normal;
// in vec2 a_textureCoordinates;

// // uniform mat4 u_worldViewProjectionMatrix;
// uniform mat4 u_projectionMatrix;
// // uniform mat4 u_inverseTransposeWorldMatrix;
// // uniform mat4 u_worldMatrix;
// // uniform vec3 u_cameraWorldPosition;
// // uniform mat4 u_lightViewProjectionTextureMatrix;
// uniform mat4 u_textureMatrix; // u_inverseViewLightViewProjectionMatrix
// // uniform mat4 u_lightViewProjectionTextureMatrix2;
// uniform mat4 u_textureMatrix2;
// uniform mat4 u_textureAnimationMatrix;

// // out vec3 var_normal;
// out vec3 var_cam_normal;
// out vec3 var_surfaceToCameraDirection;
// // out vec3 surfacePosition;
// out vec2 var_textureCoordinates;
// out vec4 var_projectedTexcoord;
// out vec4 var_projectedTexcoord2;

// void main() {
// //     gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1.0);
//     gl_Position = u_projectionMatrix * vec4(a_cam_position, 1.0);
// //     var_normal = mat3(u_inverseTransposeWorldMatrix) * a_normal;
//     var_cam_normal = a_cam_normal;
// //     vec4 worldPosition = u_worldMatrix * vec4(a_position, 1.0);
// //     vec3 pointWorldPosition = (u_worldMatrix * vec4(a_position, 1)).xyz;
// //     // for spotlight
// //     // var_surfacetoSpotlightDirection = u_spotlightPosition - pointWorldPosition;
// //     // for shininess and oren nayar
// //     var_surfaceToCameraDirection = u_cameraWorldPosition - pointWorldPosition;
//     var_surfaceToCameraDirection = -normalize(a_cam_position);
// //     // textures
//     var_textureCoordinates = (u_textureAnimationMatrix * vec4(a_textureCoordinates, 0.0, 1.0)).xy;
//     var_textureCoordinates.y -= 0.5;
//     // var_projectedTexcoord = u_lightViewProjectionTextureMatrix * worldPosition;  // u_inverseViewLightViewProjectionMatrix
//     var_projectedTexcoord = u_textureMatrix * vec4(a_cam_position, 1.0);
//     // var_projectedTexcoord2 = u_lightViewProjectionTextureMatrix2 * worldPosition;
//     var_projectedTexcoord2 = u_textureMatrix2 * vec4(a_cam_position, 1.0);
// }