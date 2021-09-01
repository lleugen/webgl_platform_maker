#version 300 es
precision highp float;

in vec3 var_normal;
in vec3 var_surfaceToCameraDirection;
in vec3 var_surfacetoSpotlightDirection;
in vec2 var_textureCoordinates;
in vec4 var_projectedTexcoord;
in vec4 var_projectedTexcoord2;
// in vec4 var_projectedTexcoord3;


uniform vec4 u_color;
uniform vec3 u_reverseLightDirection;
uniform vec3 u_secondaryLightDirection;
// uniform vec3 u_uniformLightColor;
// uniform vec3 u_spotlightDirection;
// uniform float u_spotlightInnerLimit;
// uniform float u_spotlightOuterLimit;
uniform sampler2D u_texture;
uniform sampler2D u_depthTexture;
uniform sampler2D u_depthTexture2;
// uniform sampler2D u_depthTexture3;

uniform float u_bias;
uniform samplerCube u_cubeTexture;
uniform float u_colorOpacity;
uniform float u_textureOpacity;
// uniform float u_ambientOpacity;
uniform float u_toonDiffuseThreshold;
uniform float u_toonSpecularThreshold;
uniform float u_roughness;
// uniform float u_decay;
// uniform float u_spotlightPower;

out vec4 color;

void main() {
  color = texture(u_texture, var_textureCoordinates) * u_textureOpacity + u_color * u_colorOpacity;

  // normalize varying vectors since interpolation can produce non unitary vectors
  vec3 normal = normalize(var_normal);
  vec3 surfaceToCameraDirection = normalize(var_surfaceToCameraDirection);
  // vec3 surfaceToSpotlightDirection = normalize(var_surfacetoSpotlightDirection);

  // calculate half vectors used for blinn specular reflection
  // vec3 halfVectorSpotlight = normalize(surfaceToSpotlightDirection + surfaceToCameraDirection);
  vec3 halfVectorUniformLight = normalize(u_reverseLightDirection + surfaceToCameraDirection);

  // lambert diffuse uniform light
  float uniformLight = clamp(dot(normal, u_reverseLightDirection), 0.0, 1.0);
  float secondaryUniformLight = clamp(dot(normal, u_secondaryLightDirection), 0.0, 1.0) * 0.5;
  // spotlight
  // float dotFromDir = dot(surfaceToSpotlightDirection, -u_spotlightDirection);
  // float spotlight = smoothstep(u_spotlightOuterLimit, u_spotlightInnerLimit, dotFromDir) * clamp(dot(normal, surfaceToSpotlightDirection), 0.0, 1.0);

  // specular reflection using Blinn model
  float specularUniformLight = pow(clamp(dot(normal, halfVectorUniformLight), 0.0, 1.0), 1.0);
  // float specularSpotlight = smoothstep(u_spotlightOuterLimit, u_spotlightInnerLimit, dotFromDir) * pow(clamp(dot(normal, halfVectorSpotlight), 0.0, 1.0), 10.0);
  // specular reflection using Phong model
  float phongSpecularUniformLight = pow(clamp(dot(surfaceToCameraDirection, -reflect(u_reverseLightDirection, normal)), 0.0, 1.0), 1.0);
  // toon light
  float toonDiffuse = smoothstep(u_toonDiffuseThreshold / 2.0, u_toonDiffuseThreshold, uniformLight);
  float toonSpecular = smoothstep(u_toonSpecularThreshold - 0.1, u_toonSpecularThreshold, phongSpecularUniformLight);
  // sum all specular contributions
  float specular = specularUniformLight;

  // oren-nayar diffuse
  // main uniform light
  vec3 vi = normalize(u_reverseLightDirection - dot(u_reverseLightDirection, normal) * normal);
  vec3 vr = normalize(surfaceToCameraDirection - dot(surfaceToCameraDirection, normal) * normal);
  float theta_i = acos(dot(u_reverseLightDirection, normal));
  float theta_r = acos(dot(surfaceToCameraDirection, normal));
  float A = 1.0 - 0.5 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.33);
  float B = 0.45 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.09);
  float G = max(0.0, dot(vi, vr));
  float l1 = dot(u_reverseLightDirection, normal);
  float l2 = clamp(l1, 0.0, 1.0);
  float ON_diffuse = l2 * (A + (B * G * sin(max(theta_i, theta_r)) * tan(min(theta_i, theta_r)) ));
  // secondary uniform light
  vi = normalize(u_secondaryLightDirection - dot(u_secondaryLightDirection, normal) * normal);
  vr = normalize(surfaceToCameraDirection - dot(surfaceToCameraDirection, normal) * normal);
  theta_i = acos(dot(u_secondaryLightDirection, normal));
  theta_r = acos(dot(surfaceToCameraDirection, normal));
  A = 1.0 - 0.5 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.33);
  B = 0.45 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.09);
  G = max(0.0, dot(vi, vr));
  l1 = dot(u_secondaryLightDirection, normal);
  l2 = clamp(l1, 0.0, 1.0);
  float ON_diffuse_secondUniformLight = l2 * (A + (B * G * sin(max(theta_i, theta_r)) * tan(min(theta_i, theta_r)) ));
  // // spotlight
  // vi = normalize(surfaceToSpotlightDirection - dot(surfaceToSpotlightDirection, normal) * normal);
  // vr = normalize(surfaceToCameraDirection - dot(surfaceToCameraDirection, normal) * normal);
  // theta_i = acos(dot(surfaceToSpotlightDirection, normal));
  // theta_r = acos(dot(surfaceToCameraDirection, normal));
  // A = 1.0 - 0.5 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.33);
  // B = 0.45 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.09);
  // G = max(0.0, dot(vi, vr));
  // l1 = dot(surfaceToSpotlightDirection, normal);
  // l2 = clamp(l1, 0.0, 1.0);
  // // add decay for spotlight
  // float len = sqrt(pow(var_surfacetoSpotlightDirection.x, 2.0) + pow(var_surfacetoSpotlightDirection.y, 2.0) + pow(var_surfacetoSpotlightDirection.z, 2.0));
  // spotlight *= pow((u_spotlightPower / len), u_decay);
  // float ON_diffuse_spotlight = spotlight * (A + (B * G * sin(max(theta_i, theta_r)) * tan(min(theta_i, theta_r)) ));

  
  
  // shadow
  // main uniform light
  vec3 projectedTexcoord = var_projectedTexcoord.xyz / var_projectedTexcoord.w;
  bool inRange =
    projectedTexcoord.x >= 0.0 &&
    projectedTexcoord.x <= 1.0 &&
    projectedTexcoord.y >= 0.0 &&
    projectedTexcoord.y <= 1.0;

  float currentDepth = projectedTexcoord.z + u_bias;
  float projectedDepth = texture(u_depthTexture, projectedTexcoord.xy).r;

  if(inRange){
    if(currentDepth > projectedDepth){
      // in the shadow
      uniformLight = 0.0; 
      ON_diffuse = 0.0;
    }
  }
  // secondary uniform light
  vec3 projectedTexcoord2 = var_projectedTexcoord2.xyz / var_projectedTexcoord2.w;
  bool inRange2 =
    projectedTexcoord2.x >= 0.0 &&
    projectedTexcoord2.x <= 1.0 &&
    projectedTexcoord2.y >= 0.0 &&
    projectedTexcoord2.y <= 1.0;

  float currentDepth2 = projectedTexcoord2.z + u_bias;
  float projectedDepth2 = texture(u_depthTexture2, projectedTexcoord2.xy).r;

  if(inRange2){
    if(currentDepth2 > projectedDepth2){
      // in the shadow
      secondaryUniformLight = 0.0; 
      ON_diffuse_secondUniformLight = 0.0;
    }
  }
  // // spotlight
  // vec3 projectedTexcoord3 = var_projectedTexcoord3.xyz / var_projectedTexcoord3.w;
  // bool inRange3 =
  //   projectedTexcoord2.x >= 0.0 &&
  //   projectedTexcoord2.x <= 1.0 &&
  //   projectedTexcoord2.y >= 0.0 &&
  //   projectedTexcoord2.y <= 1.0;

  // float currentDepth3 = projectedTexcoord3.z + u_bias;
  // float projectedDepth3 = texture(u_depthTexture3, projectedTexcoord3.xy).r;

  // if(inRange3){
  //   if(currentDepth3 > projectedDepth3){
  //     // in the shadow
  //     spotlight = 0.0;
  //     ON_diffuse_spotlight = 0.0;
  //   }
  // }

  // environment map
  vec3 direction = reflect(-var_surfaceToCameraDirection, normal);
  vec4 ambient = texture(u_cubeTexture, direction);

  // sum all light contributions
  color.rgb *= (ON_diffuse + ON_diffuse_secondUniformLight);
}

// // convert to camera space calculations
// in vec3 var_cam_normal;
// in vec3 var_surfaceToCameraDirection;
// in vec2 var_textureCoordinates;
// in vec4 var_projectedTexcoord;
// in vec4 var_projectedTexcoord2;

// uniform vec4 u_color;
// uniform vec3 u_reverseLightDirection;
// uniform vec3 u_secondaryLightDirection;
// uniform sampler2D u_texture;
// uniform sampler2D u_depthTexture;
// uniform sampler2D u_depthTexture2;

// uniform float u_bias;
// uniform samplerCube u_cubeTexture;
// uniform float u_colorOpacity;
// uniform float u_textureOpacity;
// uniform float u_toonDiffuseThreshold;
// uniform float u_toonSpecularThreshold;
// uniform float u_roughness;

// out vec4 color;

// void main() {
//   color = texture(u_texture, var_textureCoordinates) * u_textureOpacity + u_color * u_colorOpacity;

//   // normalize varying vectors since interpolation can produce non unitary vectors
//   vec3 normal = normalize(var_cam_normal);
//   vec3 surfaceToCameraDirection = normalize(var_surfaceToCameraDirection);

//   // calculate half vectors used for blinn specular reflection
//   // vec3 halfVectorSpotlight = normalize(surfaceToSpotlightDirection + surfaceToCameraDirection);
//   vec3 halfVectorUniformLight = normalize(u_reverseLightDirection + surfaceToCameraDirection);

//   // lambert diffuse uniform light
//   float uniformLight = clamp(dot(normal, u_reverseLightDirection), 0.0, 1.0);
//   float secondaryUniformLight = clamp(dot(normal, u_secondaryLightDirection), 0.0, 1.0) * 0.5;
//   // spotlight
//   // float dotFromDir = dot(surfaceToSpotlightDirection, -u_spotlightDirection);
//   // float spotlight = smoothstep(u_spotlightOuterLimit, u_spotlightInnerLimit, dotFromDir) * clamp(dot(normal, surfaceToSpotlightDirection), 0.0, 1.0);

//   // // specular reflection using Blinn model
//   // float specularUniformLight = pow(clamp(dot(normal, halfVectorUniformLight), 0.0, 1.0), 1.0);
//   // // float specularSpotlight = smoothstep(u_spotlightOuterLimit, u_spotlightInnerLimit, dotFromDir) * pow(clamp(dot(normal, halfVectorSpotlight), 0.0, 1.0), 10.0);
//   // // specular reflection using Phong model
//   float phongSpecularUniformLight = pow(clamp(dot(surfaceToCameraDirection, -reflect(u_reverseLightDirection, normal)), 0.0, 1.0), 1.0);
//   // toon light
//   float toonDiffuse = smoothstep(u_toonDiffuseThreshold / 2.0, u_toonDiffuseThreshold, uniformLight);
//   float toonSpecular = smoothstep(u_toonSpecularThreshold - 0.1, u_toonSpecularThreshold, phongSpecularUniformLight);
//   // // sum all specular contributions
//   // float specular = specularUniformLight;

//   // oren-nayar diffuse
//   // main uniform light
//   vec3 vi = normalize(u_reverseLightDirection - dot(u_reverseLightDirection, normal) * normal);
//   vec3 vr = normalize(surfaceToCameraDirection - dot(surfaceToCameraDirection, normal) * normal);
//   float theta_i = acos(dot(u_reverseLightDirection, normal));
//   float theta_r = acos(dot(surfaceToCameraDirection, normal));
//   float A = 1.0 - 0.5 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.33);
//   float B = 0.45 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.09);
//   float G = max(0.0, dot(vi, vr));
//   float l1 = dot(u_reverseLightDirection, normal);
//   float l2 = clamp(l1, 0.0, 1.0);
//   float ON_diffuse = l2 * (A + (B * G * sin(max(theta_i, theta_r)) * tan(min(theta_i, theta_r)) ));
//   // secondary uniform light
//   vi = normalize(u_secondaryLightDirection - dot(u_secondaryLightDirection, normal) * normal);
//   vr = normalize(surfaceToCameraDirection - dot(surfaceToCameraDirection, normal) * normal);
//   theta_i = acos(dot(u_secondaryLightDirection, normal));
//   theta_r = acos(dot(surfaceToCameraDirection, normal));
//   A = 1.0 - 0.5 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.33);
//   B = 0.45 * pow(u_roughness, 2.0) / (pow(u_roughness, 2.0) + 0.09);
//   G = max(0.0, dot(vi, vr));
//   l1 = dot(u_secondaryLightDirection, normal);
//   l2 = clamp(l1, 0.0, 1.0);
//   float ON_diffuse_secondUniformLight = l2 * (A + (B * G * sin(max(theta_i, theta_r)) * tan(min(theta_i, theta_r)) ));
  
//   // shadow
//   // main uniform light
//   vec3 projectedTexcoord = var_projectedTexcoord.xyz / var_projectedTexcoord.w;
//   bool inRange =
//     projectedTexcoord.x >= 0.0 &&
//     projectedTexcoord.x <= 1.0 &&
//     projectedTexcoord.y >= 0.0 &&
//     projectedTexcoord.y <= 1.0;

//   float currentDepth = projectedTexcoord.z + u_bias;
//   float projectedDepth = texture(u_depthTexture, projectedTexcoord.xy).r;

//   if(inRange){
//     if(currentDepth > projectedDepth){
//       // in the shadow
//       uniformLight = 0.0; 
//       ON_diffuse = 0.0;
//     }
//   }
//   // secondary uniform light
//   vec3 projectedTexcoord2 = var_projectedTexcoord2.xyz / var_projectedTexcoord2.w;
//   bool inRange2 =
//     projectedTexcoord2.x >= 0.0 &&
//     projectedTexcoord2.x <= 1.0 &&
//     projectedTexcoord2.y >= 0.0 &&
//     projectedTexcoord2.y <= 1.0;

//   float currentDepth2 = projectedTexcoord2.z + u_bias;
//   float projectedDepth2 = texture(u_depthTexture2, projectedTexcoord2.xy).r;

//   if(inRange2){
//     if(currentDepth2 > projectedDepth2){
//       // in the shadow
//       secondaryUniformLight = 0.0; 
//       l2 = 0.0;
//       ON_diffuse_secondUniformLight = 0.0;
//     }
//   }

//   // // environment map
//   // vec3 direction = reflect(-var_surfaceToCameraDirection, normal);
//   // vec4 ambient = texture(u_cubeTexture, direction);

//   // sum all light contributions
//   color.rgb *= (ON_diffuse + ON_diffuse_secondUniformLight);
//   // color.rgb *= toonDiffuse;
//   // color.rgb += toonSpecular;

// }