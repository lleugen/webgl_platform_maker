#version 300 es
precision highp float;

in vec2 a_position;
out vec4 var_position;

void main(){
    var_position = vec4(a_position, 1.0, 1.0);
    gl_Position = vec4(a_position, 1.0, 1.0);
    gl_Position.z = 1.0;
}