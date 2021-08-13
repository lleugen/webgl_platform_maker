#version 300 es
precision highp float;

// uniform vec4 light;
uniform vec4 matcol;

out vec4 color;
flat in vec3 var_normal;
// uniform vec3 var_normal;
uniform vec3 u_reverseLightDirection;

void main() {
    color = matcol;

    vec3 normal = normalize(var_normal);
    float light = dot(normal, u_reverseLightDirection);
    color.rgb *= light;
}