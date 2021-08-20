#version 300 es
precision highp float;

in vec3 var_normal;
in vec3 var_surfaceToLightDirection;

uniform vec4 u_color;

out vec4 color;

void main() {
    vec3 surfaceToLightDirection = normalize(var_surfaceToLightDirection);
    color = u_color;

    vec3 normal = normalize(var_normal);
    float light = dot(normal, surfaceToLightDirection);
    color.rgb *= light;
}