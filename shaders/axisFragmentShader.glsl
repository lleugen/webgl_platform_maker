#version 300 es
      
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;
out vec4 FragColor;
in vec3 fs_pos;

void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    FragColor = vec4(fs_pos.x/10.0, fs_pos.y/10.0, fs_pos.z/10.0, 1);
}