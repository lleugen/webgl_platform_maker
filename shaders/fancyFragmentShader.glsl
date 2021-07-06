#version 300 es
precision highp float;

in vec3 fs_pos;

uniform vec4 light;
uniform vec4 matcol;

out vec4 color;

void main() {
    vec3 X = dFdx(fs_pos);
    vec3 Y = dFdy(fs_pos);
    vec3 n_norm = normalize(cross(X,Y));
    
    float dimFact = light.w * clamp(dot(n_norm, light.xyz),0.0,1.0);
    //dimFact += lightDir2.w * clamp(dot(n_norm, lightDir2.xyz),0.0,1.0);
    //dimFact += lightDir3.w * clamp(dot(n_norm, lightDir3.xyz),0.0,1.0);
    dimFact = dimFact * matcol.a + (1.0 - matcol.a);
    color = vec4(min(matcol.rgb * dimFact, vec3(1.0, 1.0, 1.0)), 1.0);
}