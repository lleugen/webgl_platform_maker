#version 300 es
// local space
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}

// // camera space
// precision highp float;

// uniform vec4 u_color;

// out vec4 outColor;

// void main() {
//   outColor = u_color;
// }