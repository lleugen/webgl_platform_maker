#version 300 es
precision highp float;

in vec3 var_normal;

uniform vec4 u_color;
uniform vec3 u_reverseLightDirection;

out vec4 color;

void main() {
    color = u_color;

    vec3 normal = normalize(var_normal);
    float light = dot(normal, u_reverseLightDirection);
    color.rgb *= light;
}