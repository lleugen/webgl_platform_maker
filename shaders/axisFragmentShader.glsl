#version 300 es
      
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;
out vec4 FragColor;
in vec3 fs_pos;

void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    float red = (fs_pos.y == 0.0 && fs_pos.z == 0.0) ? 1.0 : 0.0;
    float green = (fs_pos.x == 0.0 && fs_pos.z == 0.0) ? 1.0 : 0.0;
    float blue = (fs_pos.x == 0.0 && fs_pos.y == 0.0) ? 1.0 : 0.0;
    // FragColor = vec4(fs_pos.x/10.0, fs_pos.y/10.0, fs_pos.z/10.0, 1);
    FragColor = vec4(red, green, blue, 1.0);

}