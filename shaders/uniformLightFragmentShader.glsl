#version 300 es
precision highp float;

in vec3 var_normal;
in vec3 var_surfaceToLightDirection;
in vec3 var_surfaceToCameraDirection;
in vec3 var_surfacetoSpotlightDirection;
in vec2 var_textureCoordinates;

uniform vec4 u_color;
uniform vec3 u_reverseLightDirection;
uniform vec3 u_uniformLightColor;
uniform vec3 u_pointLightColor;
uniform vec3 u_spotlightDirection;
uniform float u_spotlightInnerLimit;
uniform float u_spotlightOuterLimit;
uniform sampler2D u_texture;


out vec4 color;

void main() {
    // color = u_color;
    color = texture(u_texture, var_textureCoordinates);
    

    // uniform light
    vec3 normal = normalize(var_normal);
    vec3 surfaceToCameraDirection = normalize(var_surfaceToCameraDirection);

    float uniformLight = clamp(dot(normal, u_reverseLightDirection), 0.0, 1.0);
    float anotherUniformLight = clamp(dot(normal, vec3(1,1,1)), 0.0, 1.0);

    // point light
    vec3 surfaceToLightDirection = normalize(var_surfaceToLightDirection);
    float pointLight = clamp(dot(normal, surfaceToLightDirection), 0.0, 1.0);
    // add decay
    float len = sqrt(pow(var_surfaceToLightDirection.x, 2.0) + pow(var_surfaceToLightDirection.y, 2.0) + pow(var_surfaceToLightDirection.z, 2.0));
    pointLight *= pow((10.0 / len), 2.0);

    //spotlight
    vec3 surfaceToSpotlightDirection = normalize(var_surfacetoSpotlightDirection);
    float dotFromDir = dot(surfaceToSpotlightDirection, -u_spotlightDirection);
    float spotlight = smoothstep(u_spotlightOuterLimit, u_spotlightInnerLimit, dotFromDir) * clamp(dot(normal, surfaceToSpotlightDirection), 0.0, 1.0);
    vec3 halfVectorSpotlight = normalize(surfaceToSpotlightDirection + surfaceToCameraDirection);
    float specularSpotlight = smoothstep(u_spotlightOuterLimit, u_spotlightInnerLimit, dotFromDir) * pow(clamp(dot(normal, halfVectorSpotlight), 0.0, 1.0), 10.0);
    // add decay
    len = sqrt(pow(var_surfacetoSpotlightDirection.x, 2.0) + pow(var_surfacetoSpotlightDirection.y, 2.0) + pow(var_surfacetoSpotlightDirection.z, 2.0));
    spotlight *= pow((10.0 / len), 2.0);

    vec3 light = (spotlight*vec3(1,1,1)) + (pointLight * u_pointLightColor) + (uniformLight * u_uniformLightColor);
    color.rgb *= light;

    // shiny
    vec3 halfVectorPointLight = normalize(surfaceToLightDirection + surfaceToCameraDirection);
    float specularPointLight = pow(clamp(dot(normal, halfVectorPointLight), 0.0, 1.0), 10.0);
    vec3 halfVectorUniformLight = normalize(u_reverseLightDirection + surfaceToCameraDirection);
    float specularUniformLight = pow(clamp(dot(normal, halfVectorUniformLight), 0.0, 1.0), 10.0);

    float specular = specularSpotlight + specularPointLight + specularUniformLight;
    // color.rgb += specular;
    

    
}