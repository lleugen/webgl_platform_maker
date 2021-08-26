#version 300 es
precision highp float;

in vec4 var_position;

uniform samplerCube u_skybox;
uniform mat4 u_inverseViewProjectionMatrix;

out vec4 outColor;

void main() {
  vec4 t = -u_inverseViewProjectionMatrix * var_position;
  outColor = texture(u_skybox, normalize(t.xyz / t.w));
}